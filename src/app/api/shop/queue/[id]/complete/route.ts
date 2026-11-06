import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"
import { createNotificationAction } from "@/lib/actions/notification.actions"

export const runtime = "nodejs"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const { id } = await params

  const queueItem = await prisma.queueItem.findUnique({
    where: { id },
    include: { order: true, printer: true },
  })
  if (!queueItem) return apiError("Queue item not found", 404)

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
  })
  if (!shop || queueItem.shopId !== shop.id) return apiError("Unauthorized", 403)

  await prisma.$transaction(async (tx) => {
    await tx.queueItem.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    })
    await tx.order.update({
      where: { id: queueItem.orderId },
      data: { status: "QUALITY_CHECK" },
    })
    if (queueItem.printer) {
      await tx.printer.update({
        where: { id: queueItem.printer.id },
        data: { status: "ONLINE" },
      })
    }
  })

  if (queueItem.order.userId) {
    await createNotificationAction(
      queueItem.order.userId,
      "Quality Check",
      `Your order ${queueItem.order.orderId} has finished printing and is awaiting quality check.`,
      "ORDER",
      `/customer/track?order=${queueItem.order.orderId}`,
    )
  }

  return NextResponse.json({ success: true })
}