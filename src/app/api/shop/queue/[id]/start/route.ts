import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"
import { createNotificationAction } from "@/lib/actions/notification.actions"
import { printFile } from "@/lib/print-service"

export const runtime = "nodejs"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const { id } = await params

  let body: { printerId?: string }
  try {
    body = await req.json()
  } catch {
    return apiError("Invalid JSON body")
  }
  if (!body.printerId) return apiError("printerId is required")

  const queueItem = await prisma.queueItem.findUnique({
    where: { id },
    include: { order: { include: { files: true } } },
  })
  if (!queueItem) return apiError("Queue item not found", 404)

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
  })
  if (!shop || queueItem.shopId !== shop.id) return apiError("Unauthorized", 403)

  const printer = await prisma.printer.findUnique({ where: { id: body.printerId } })
  if (!printer) return apiError("Printer not found", 404)

  await prisma.$transaction([
    prisma.queueItem.update({
      where: { id },
      data: {
        status: "PRINTING",
        printerId: printer.id,
        startedAt: new Date(),
        assignedTo: user!.name,
      },
    }),
    prisma.order.update({
      where: { id: queueItem.orderId },
      data: { status: "PRINTING" },
    }),
    prisma.printer.update({
      where: { id: printer.id },
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
          shopId: shop.id,
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

  return NextResponse.json({ success: true })
}