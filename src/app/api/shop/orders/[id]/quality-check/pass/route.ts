import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"
import { createNotificationAction } from "@/lib/actions/notification.actions"

export const runtime = "nodejs"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const { id } = await params

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
  })
  if (!shop) return apiError("Unauthorized", 403)

  const order = await prisma.order.findUnique({
    where: { id },
    select: { shopId: true, orderId: true, userId: true },
  })
  if (!order || order.shopId !== shop.id) return apiError("Order not found", 404)

  await prisma.order.update({
    where: { id },
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

  return NextResponse.json({ success: true })
}