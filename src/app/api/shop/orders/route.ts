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

  const url = new URL(req.url)
  const status = url.searchParams.get("status")

  const where: Record<string, unknown> = { shopId: shop.id }
  if (status && status !== "all") where.status = status

  const orders = await prisma.order.findMany({
    where: where as never,
    include: { customer: true, files: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      orderId: o.orderId,
      status: o.status,
      pages: o.pages,
      copies: o.copies,
      color: o.color,
      paperSize: o.paperSize,
      sides: o.sides,
      total: o.total,
      notes: o.notes,
      createdAt: o.createdAt.toISOString(),
      estimatedReadyAt: o.estimatedReadyAt?.toISOString() || null,
      customer: o.customer ? { id: o.customer.id, name: o.customer.name, email: o.customer.email, phone: o.customer.phone } : null,
      files: o.files.map((f) => ({ id: f.id, name: f.name, url: f.url, size: f.size, type: f.type, pages: f.pages })),
    })),
  })
}