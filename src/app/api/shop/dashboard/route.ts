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

  const [
    totalOrders,
    totalRevenue,
    pagesPrinted,
    pendingOrders,
    recentOrders,
    queueCount,
    printerCount,
    onlinePrinters,
    statusCounts,
  ] = await Promise.all([
    prisma.order.count({ where: { shopId: shop.id } }),
    prisma.order.aggregate({ where: { shopId: shop.id }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { shopId: shop.id }, _sum: { pages: true } }),
    prisma.order.count({ where: { shopId: shop.id, status: { in: ["PENDING", "IN_QUEUE", "PROCESSING", "PRINTING", "QUALITY_CHECK"] } } }),
    prisma.order.findMany({
      where: { shopId: shop.id },
      select: { id: true, orderId: true, status: true, pages: true, total: true, createdAt: true, customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.queueItem.count({ where: { shopId: shop.id, status: { in: ["QUEUED", "PRINTING"] } } }),
    prisma.printer.count({ where: { shopId: shop.id } }),
    prisma.printer.count({ where: { shopId: shop.id, status: "ONLINE" } }),
    prisma.order.groupBy({ by: ["status"], where: { shopId: shop.id }, _count: { id: true } }),
  ])

  const statusDist = Object.fromEntries(statusCounts.map((s) => [s.status, s._count.id])) as Record<string, number>

  return NextResponse.json({
    stats: {
      totalOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      pagesPrinted: pagesPrinted._sum.pages ?? 0,
      pendingOrders,
      queueCount,
      printerCount,
      onlinePrinters,
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderId: o.orderId,
      status: o.status,
      pages: o.pages,
      total: o.total,
      createdAt: o.createdAt.toISOString(),
      customer: o.customer ? { name: o.customer.name, email: o.customer.email } : null,
    })),
    statusDist,
    shop: { id: shop.id, name: shop.name, slug: shop.slug, city: shop.city },
  })
}