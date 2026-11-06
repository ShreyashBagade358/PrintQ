import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
  })
  if (!shop) return apiError("No shop found", 404)

  const items = await prisma.queueItem.findMany({
    where: { shopId: shop.id, status: "COMPLETED" },
    include: { order: { include: { customer: true } }, printer: true },
    orderBy: { completedAt: "desc" },
    take: 20,
  })

  return NextResponse.json({
    queue: items.map((q) => ({
      id: q.id,
      status: q.status,
      position: q.position,
      createdAt: q.createdAt.toISOString(),
      startedAt: q.startedAt?.toISOString() || null,
      completedAt: q.completedAt?.toISOString() || null,
      printer: q.printer ? { id: q.printer.id, name: q.printer.name } : null,
      order: q.order
        ? {
            id: q.order.id,
            orderId: q.order.orderId,
            pages: q.order.pages,
            total: q.order.total,
            customer: q.order.customer ? { name: q.order.customer.name, email: q.order.customer.email } : null,
          }
        : null,
    })),
  })
}