"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { printFile, cancelPrintJob, holdPrintJob, resumePrintJob } from "@/lib/print-service"
import { createNotificationAction } from "./notification.actions"

const operatorSettingsSchema = z.object({
  paperTray: z.string().optional(),
  pagesPerSheet: z.number().min(1).max(16).default(1),
  layoutDirection: z.enum(["horizontal", "reverse-horizontal", "vertical", "reverse-vertical"]).default("horizontal"),
  paperHandling: z.enum(["auto", "manual", "tray"]).default("auto"),
  scaling: z.number().min(25).max(400).default(100),
  autoRotate: z.boolean().default(true),
  colorMode: z.enum(["auto", "color", "grayscale", "monochrome"]).default("auto"),
  dpi: z.number().default(300),
  margins: z.enum(["none", "minimum", "normal", "custom"]).default("normal"),
  customMarginTop: z.number().optional(),
  customMarginBottom: z.number().optional(),
  customMarginLeft: z.number().optional(),
  customMarginRight: z.number().optional(),
  brightness: z.number().min(-100).max(100).default(0),
  contrast: z.number().min(-100).max(100).default(0),
})

export async function saveOperatorSettingsAction(orderId: string, _prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return { error: "Order not found" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop || order.shopId !== shop.id) return { error: "Unauthorized" }

  const raw = JSON.parse(formData.get("data") as string)
  const validated = operatorSettingsSchema.safeParse(raw)
  if (!validated.success) return { error: validated.error.errors[0].message }

  const existingSettings = (order.printSettings as Record<string, unknown>) || {}
  await prisma.order.update({
    where: { id: orderId },
    data: {
      printSettings: { ...existingSettings, operator: validated.data },
    },
  })

  revalidatePath(`/shop/orders/${orderId}`)
  return { success: true }
}

export async function startPrintWithSettingsAction(orderId: string, queueItemId: string, printerId: string) {
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

  const order = queueItem.order
  const settings = (order.printSettings as { operator?: Record<string, unknown> } | null)?.operator || {}
  const customerSettings = order.printSettings as Record<string, unknown> | null

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
      where: { id: order.id },
      data: { status: "PRINTING" },
    }),
    prisma.printer.update({
      where: { id: printerId },
      data: { status: "BUSY" },
    }),
  ])

  const printerName = printer.name.trim()

  if (order.files.length > 0) {
    const printResults: string[] = []
    for (const file of order.files) {
      try {
        const qualityMap: Record<string, 3 | 4 | 5> = { draft: 3, normal: 4, high: 5 }
        const customerQuality = customerSettings?.printQuality as string | undefined

        const result = await printFile(printerName, file.url, file.name, {
          copies: order.copies,
          sides: order.sides === "Double Sided" ? "two-sided-long-edge" : "one-sided",
          color: order.color === "Color",
          paperSize: order.paperSize,
          orientation: (customerSettings?.orientation as "portrait" | "landscape") || undefined,
          pageRanges: customerSettings?.pageRange === "custom" ? (customerSettings?.customPageRange as string) : undefined,
          printQuality: qualityMap[customerQuality || "normal"],
          pagesPerSheet: (settings.pagesPerSheet as number) || undefined,
          fitToPage: (settings.scaling as number) !== 100 || undefined,
          paperTray: (settings.paperTray as string) || undefined,
          brightness: (settings.brightness as number) || undefined,
          contrast: (settings.contrast as number) || undefined,
          colorMode: (settings.colorMode as "auto" | "color" | "grayscale" | "monochrome") || undefined,
          scale: (settings.scaling as number) !== 100 ? (settings.scaling as number) : undefined,
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

  revalidatePath("/shop/queue")
  revalidatePath("/shop/orders")
  revalidatePath("/shop/dashboard")
  revalidatePath(`/shop/orders/${orderId}`)

  return { success: true }
}

export async function cancelOrderPrintJobAction(orderId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return { error: "Order not found" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop || order.shopId !== shop.id) return { error: "Unauthorized" }

  const activeItem = await prisma.queueItem.findFirst({
    where: { orderId, status: { in: ["QUEUED", "PRINTING"] } },
    include: { printer: true },
  })
  if (!activeItem) return { error: "No active print job" }

  if (activeItem.status === "PRINTING") {
    await cancelPrintJob(`${activeItem.printer?.name || "unknown"}-${activeItem.id}`)
  }

  await prisma.$transaction([
    prisma.queueItem.update({
      where: { id: activeItem.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", completedAt: new Date() },
    }),
  ])

  if (activeItem.printerId) {
    await prisma.printer.update({
      where: { id: activeItem.printerId },
      data: { status: "ONLINE" },
    })
  }

  revalidatePath(`/shop/orders/${orderId}`)
  revalidatePath("/shop/orders")
  revalidatePath("/shop/queue")

  return { success: true }
}

export async function acceptPayLaterOrderAction(orderId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { queueItems: true },
  })
  if (!order) return { error: "Order not found" }
  if (order.status !== "RECEIVED") return { error: "Order is not in RECEIVED status" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop || order.shopId !== shop.id) return { error: "Unauthorized" }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "IN_QUEUE",
      estimatedReadyAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      printNotes: `${order.printNotes || ""}\n--- Payment received at shop on ${new Date().toLocaleString()} ---`.trim(),
    },
  })

  await prisma.queueItem.create({
    data: {
      position: (await prisma.queueItem.count({ where: { shopId: shop.id } })) + 1,
      status: "QUEUED",
      shopId: shop.id,
      orderId: order.id,
    },
  })

  const customer = await prisma.customer.findUnique({ where: { id: order.customerId } })
  if (customer) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { totalOrders: { increment: 1 }, totalSpent: { increment: order.total } },
    })
  }

  if (order.userId) {
    await createNotificationAction(
      order.userId,
      "Payment Accepted",
      `Your payment for order ${order.orderId} has been accepted. Your order is now in queue.`,
      "PAYMENT",
      `/customer/track?order=${order.orderId}`,
      shop.id,
    )
  }

  revalidatePath(`/shop/orders/${orderId}`)
  revalidatePath("/shop/orders")
  revalidatePath("/shop/queue")
  revalidatePath("/shop/dashboard")

  return { success: true }
}

export async function reprintOrderAction(orderId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { queueItems: true } })
  if (!order) return { error: "Order not found" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop || order.shopId !== shop.id) return { error: "Unauthorized" }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "RECEIVED", printNotes: `${order.printNotes || ""}\n--- Reprint requested at ${new Date().toLocaleString()} ---` },
  })

  await prisma.queueItem.create({
    data: {
      position: (await prisma.queueItem.count({ where: { shopId: shop.id } })) + 1,
      status: "QUEUED",
      shopId: shop.id,
      orderId: order.id,
    },
  })

  revalidatePath(`/shop/orders/${orderId}`)
  revalidatePath("/shop/queue")

  return { success: true }
}
