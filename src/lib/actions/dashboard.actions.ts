"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getShopDashboardAction() {
  const session = await auth()
  if (!session?.user) return null

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return null

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
    prisma.order.groupBy({
      by: ["status"],
      where: { shopId: shop.id },
      _count: { id: true },
    }),
  ])

  const statusDist = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.id])
  ) as Record<string, number>

  return {
    stats: {
      totalOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      pagesPrinted: pagesPrinted._sum.pages ?? 0,
      pendingOrders,
      queueCount,
      printerCount,
      onlinePrinters,
    },
    recentOrders,
    statusDist,
  }
}

export async function getShopOrdersAction(status?: string) {
  const session = await auth()
  if (!session?.user) return []

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return []

  const where: Record<string, unknown> = { shopId: shop.id }
  if (status && status !== "all") where.status = status

  return prisma.order.findMany({
    where: where as never,
    include: { customer: true, files: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function getShopOrderDetailAction(orderId: string) {
  const session = await auth()
  if (!session?.user) return null

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return null

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      files: true,
      queueItems: { include: { printer: true }, orderBy: { createdAt: "asc" } },
    },
  })

  if (!order || order.shopId !== shop.id) return null

  return order
}
