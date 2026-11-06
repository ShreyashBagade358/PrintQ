import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"
import { createNotificationAction } from "@/lib/actions/notification.actions"

export const runtime = "nodejs"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: { queueItems: true },
  })
  if (!order) return apiError("Order not found", 404)
  if (order.status !== "RECEIVED") return apiError("Order is not in RECEIVED status", 400)

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
  })
  if (!shop || order.shopId !== shop.id) return apiError("Unauthorized", 403)

  await prisma.$transaction(async (tx) => {
    const count = await tx.queueItem.count({ where: { shopId: shop.id } })
    await tx.order.update({
      where: { id },
      data: {
        status: "IN_QUEUE",
        estimatedReadyAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        printNotes: `${order.printNotes || ""}\n--- Payment received at shop on ${new Date().toLocaleString()} ---`.trim(),
      },
    })
    await tx.queueItem.create({
      data: { position: count + 1, status: "QUEUED", shopId: shop.id, orderId: id },
    })
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

  return NextResponse.json({ success: true })
}