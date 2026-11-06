import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

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
    select: { shopId: true, orderId: true, printNotes: true },
  })
  if (!order || order.shopId !== shop.id) return apiError("Order not found", 404)

  await prisma.$transaction(async (tx) => {
    const count = await tx.queueItem.count({ where: { shopId: shop.id } })
    await tx.order.update({
      where: { id },
      data: {
        status: "PROCESSING",
        printNotes: `${order.printNotes || ""}\n--- Quality check failed at ${new Date().toLocaleString()}, re-queued for reprint ---`,
      },
    })
    await tx.queueItem.create({
      data: { position: count + 1, status: "QUEUED", shopId: shop.id, orderId: id },
    })
  })

  return NextResponse.json({ success: true })
}