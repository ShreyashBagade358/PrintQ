"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createNotificationAction } from "./notification.actions"
import { printFile } from "@/lib/print-service"

export async function getQueueAction() {
  const session = await auth()
  if (!session?.user) return []

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return []

  return prisma.queueItem.findMany({
    where: { shopId: shop.id, status: { in: ["QUEUED", "PRINTING"] } },
    include: {
      order: { include: { customer: true, files: true } },
      printer: true,
    },
    orderBy: [{ priority: "desc" }, { position: "asc" }],
  })
}

export async function getCompletedQueueAction() {
  const session = await auth()
  if (!session?.user) return []

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return []

  return prisma.queueItem.findMany({
    where: { shopId: shop.id, status: "COMPLETED" },
    include: { order: { include: { customer: true } }, printer: true },
    orderBy: { completedAt: "desc" },
    take: 20,
  })
}

export async function startPrintJobAction(queueItemId: string, printerId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const queueItem = await prisma.queueItem.findUnique({
    where: { id: queueItemId },
    include: { order: { include: { files: true } } },
  })
  if (!queueItem) return { error: "Queue item not found" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop || queueItem.shopId !== shop.id) return { error: "Unauthorized" }

  const printer = await prisma.printer.findUnique({ where: { id: printerId } })
  if (!printer) return { error: "Printer not found" }

  await prisma.$transaction([
    prisma.queueItem.update({
      where: { id: queueItemId },
      data: {
        status: "PRINTING",
        printerId,
        startedAt: new Date(),
        assignedTo: session.user.name || session.user.email,
      },
    }),
    prisma.order.update({
      where: { id: queueItem.orderId },
      data: { status: "PRINTING" },
    }),
    prisma.printer.update({
      where: { id: printerId },
      data: { status: "BUSY" },
    }),
  ])

  const order = queueItem.order
  const printerName = printer.name

  if (order.files.length > 0) {
    const printResults: string[] = []
    for (const file of order.files) {
      try {
        const result = await printFile(printerName, file.url, file.name, {
          copies: order.copies,
          sides: order.sides === "Double Sided" ? "two-sided-long-edge" : "one-sided",
          color: order.color === "Color",
          paperSize: order.paperSize,
        })
        if (result.success) {
          printResults.push(`${file.name}: job ${result.jobId}`)
        } else {
          printResults.push(`${file.name}: failed (${result.error})`)
        }
      } catch (e) {
        printResults.push(`${file.name}: error (${e instanceof Error ? e.message : "Unknown"})`)
      }
    }
    await prisma.order.update({
      where: { id: order.id },
      data: { printNotes: `Printed at ${new Date().toLocaleString()}\n${printResults.join("\n")}` },
    })
  }

  if (order.userId) {
    await createNotificationAction(
      order.userId,
      "Printing Started",
      `Your order ${order.orderId} has started printing.`,
      "ORDER",
      `/customer/track?order=${order.orderId}`,
    )
  }

  revalidatePath("/shop/queue")
  revalidatePath("/shop/orders")
  revalidatePath("/shop/dashboard")
  revalidatePath(`/shop/orders/${queueItem.orderId}`)

  return { success: true }
}

export async function completePrintJobAction(queueItemId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const queueItem = await prisma.queueItem.findUnique({
    where: { id: queueItemId },
    include: { order: true, printer: true },
  })
  if (!queueItem) return { error: "Queue item not found" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop || queueItem.shopId !== shop.id) return { error: "Unauthorized" }

  await prisma.$transaction([
    prisma.queueItem.update({
      where: { id: queueItemId },
      data: { status: "COMPLETED", completedAt: new Date() },
    }),
    prisma.order.update({
      where: { id: queueItem.orderId },
      data: { status: "QUALITY_CHECK" },
    }),
  ])

  if (queueItem.printer) {
    await prisma.printer.update({
      where: { id: queueItem.printer.id },
      data: { status: "ONLINE" },
    })
  }

  if (queueItem.order.userId) {
    await createNotificationAction(
      queueItem.order.userId,
      "Quality Check",
      `Your order ${queueItem.order.orderId} has finished printing and is awaiting quality check.`,
      "ORDER",
      `/customer/track?order=${queueItem.order.orderId}`,
    )
  }

  revalidatePath("/shop/queue")
  revalidatePath("/shop/orders")
  revalidatePath("/shop/dashboard")
  revalidatePath(`/shop/orders/${queueItem.orderId}`)

  return { success: true }
}

export async function markQualityCheckPassedAction(orderId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return { error: "Unauthorized" }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { shopId: true, orderId: true, userId: true },
  })
  if (!order || order.shopId !== shop.id) return { error: "Order not found" }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "READY" },
  })

  if (order.userId) {
    await createNotificationAction(
      order.userId,
      "Order Ready",
      `Your order ${order.orderId} has passed quality check and is ready for pickup!`,
      "ORDER",
      `/customer/track?order=${order.orderId}`,
    )
  }

  revalidatePath(`/shop/orders/${orderId}`)
  revalidatePath("/shop/orders")
  revalidatePath("/shop/dashboard")

  return { success: true }
}

export async function failQualityCheckAction(orderId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return { error: "Unauthorized" }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { shopId: true, orderId: true, printNotes: true },
  })
  if (!order || order.shopId !== shop.id) return { error: "Order not found" }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PROCESSING",
      printNotes: `${order.printNotes || ""}\n--- Quality check failed at ${new Date().toLocaleString()}, re-queued for reprint ---`,
    },
  })

  await prisma.queueItem.create({
    data: {
      position: (await prisma.queueItem.count({ where: { shopId: shop.id } })) + 1,
      status: "QUEUED",
      shopId: shop.id,
      orderId: orderId,
    },
  })

  revalidatePath(`/shop/orders/${orderId}`)
  revalidatePath("/shop/orders")
  revalidatePath("/shop/queue")

  return { success: true }
}

export async function assignPrinterToJobAction(queueItemId: string, printerId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const queueItem = await prisma.queueItem.findUnique({ where: { id: queueItemId } })
  if (!queueItem) return { error: "Queue item not found" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop || queueItem.shopId !== shop.id) return { error: "Unauthorized" }

  await prisma.queueItem.update({
    where: { id: queueItemId },
    data: { printerId },
  })

  revalidatePath("/shop/queue")
  return { success: true }
}

export async function updateQueuePriorityAction(queueItemId: string, priority: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const queueItem = await prisma.queueItem.findUnique({ where: { id: queueItemId } })
  if (!queueItem) return { error: "Queue item not found" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop || queueItem.shopId !== shop.id) return { error: "Unauthorized" }

  await prisma.$transaction([
    prisma.queueItem.update({
      where: { id: queueItemId },
      data: { priority: priority as never },
    }),
    prisma.order.update({
      where: { id: queueItem.orderId },
      data: { priority: priority as never },
    }),
  ])

  revalidatePath("/shop/queue")
  return { success: true }
}
