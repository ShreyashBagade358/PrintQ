import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

const DATE_RANGES = ["Last 7 days", "Last 30 days", "Last quarter"]

function sinceDate(range: string): Date {
  const since = new Date()
  if (range === "Last 30 days") since.setDate(since.getDate() - 30)
  else if (range === "Last quarter") since.setMonth(since.getMonth() - 3)
  else since.setDate(since.getDate() - 7)
  return since
}

export async function GET(req: Request) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
  })
  if (!shop) return apiError("No shop found", 404)

  const url = new URL(req.url)
  const type = url.searchParams.get("type") || "summary"
  const month = Number(url.searchParams.get("month") || new Date().getMonth() + 1)
  const year = Number(url.searchParams.get("year") || new Date().getFullYear())
  const days = Number(url.searchParams.get("days") || 30)
  const range = DATE_RANGES.includes(url.searchParams.get("range") || "") ? (url.searchParams.get("range") as string) : "Last 7 days"

  if (type === "monthly") {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const [aggregation, colorOrders, completedOrders, orders] = await Promise.all([
      prisma.order.aggregate({
        where: { shopId: shop.id, createdAt: { gte: startDate, lte: endDate } },
        _sum: { total: true, pages: true },
        _avg: { total: true },
        _count: true,
      }),
      prisma.order.count({ where: { shopId: shop.id, createdAt: { gte: startDate, lte: endDate }, color: "COLOR" } }),
      prisma.order.count({ where: { shopId: shop.id, createdAt: { gte: startDate, lte: endDate }, status: "COMPLETED" } }),
      prisma.order.findMany({
        where: { shopId: shop.id, createdAt: { gte: startDate, lte: endDate } },
        select: { orderId: true, pages: true, total: true, status: true, createdAt: true, customer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ])

    const totalOrders = aggregation._count
    const totalRevenue = Number(aggregation._sum.total ?? 0)
    const totalPages = aggregation._sum.pages ?? 0
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return NextResponse.json({
      type: "monthly",
      month,
      year,
      summary: { totalOrders, totalRevenue, avgOrderValue, totalPages, colorOrders, completedOrders },
      orders: orders.map((o) => ({
        id: o.orderId,
        customer: o.customer?.name || "Walk-in",
        pages: o.pages,
        amount: Number(o.total),
        status: o.status,
        date: o.createdAt.toISOString(),
      })),
    })
  }

  if (type === "customers") {
    const customers = await prisma.customer.findMany({
      where: { shopId: shop.id },
      include: { _count: { select: { orders: true } } },
      orderBy: { totalSpent: "desc" },
      take: 50,
    })

    return NextResponse.json({
      type: "customers",
      totalCustomers: customers.length,
      topCustomers: customers.slice(0, 10).map((c) => ({
        name: c.name,
        email: c.email,
        phone: c.phone,
        totalOrders: c.totalOrders,
        totalSpent: Number(c.totalSpent),
      })),
    })
  }

  const since = sinceDate(range)
  const [aggregation, statusGroups, orders] = await Promise.all([
    prisma.order.aggregate({
      where: { shopId: shop.id, createdAt: { gte: since } },
      _sum: { total: true, pages: true },
      _count: true,
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { shopId: shop.id, createdAt: { gte: since } },
      _count: { id: true },
    }),
    prisma.order.findMany({
      where: { shopId: shop.id, createdAt: { gte: since } },
      select: { orderId: true, pages: true, total: true, status: true, createdAt: true, customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ])

  const statusBreakdown: Record<string, number> = {}
  statusGroups.forEach((g) => { statusBreakdown[g.status] = g._count.id })

  const dailyData: Record<string, { orders: number; revenue: number }> = {}
  orders.forEach((o) => {
    const day = o.createdAt.toISOString().slice(0, 10)
    if (!dailyData[day]) dailyData[day] = { orders: 0, revenue: 0 }
    dailyData[day].orders++
    dailyData[day].revenue += Number(o.total)
  })

  return NextResponse.json({
    type: "summary",
    days,
    range,
    summary: {
      totalOrders: aggregation._count,
      totalRevenue: Number(aggregation._sum.total ?? 0),
      totalPages: aggregation._sum.pages ?? 0,
      statusBreakdown,
    },
    daily: Object.entries(dailyData).map(([date, data]) => ({ date, ...data })),
    orders: orders.map((o) => ({
      id: o.orderId,
      customer: o.customer?.name || "Walk-in",
      pages: o.pages,
      amount: Number(o.total),
      status: o.status,
      date: o.createdAt.toISOString(),
    })),
  })
}