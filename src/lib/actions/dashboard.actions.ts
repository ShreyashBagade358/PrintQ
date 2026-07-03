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
  ] = await Promise.all([
    prisma.order.count({ where: { shopId: shop.id } }),
    prisma.order.aggregate({ where: { shopId: shop.id }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { shopId: shop.id }, _sum: { pages: true } }),
    prisma.order.count({ where: { shopId: shop.id, status: { in: ["PENDING", "RECEIVED", "IN_QUEUE", "PROCESSING", "PRINTING", "QUALITY_CHECK"] } } }),
    prisma.order.findMany({
      where: { shopId: shop.id },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.queueItem.count({ where: { shopId: shop.id, status: { in: ["QUEUED", "PRINTING"] } } }),
    prisma.printer.count({ where: { shopId: shop.id } }),
    prisma.printer.count({ where: { shopId: shop.id, status: "ONLINE" } }),
  ])

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
  })
}

export async function getShopOrderDetailAction(orderId: string) {
  const session = await auth()
  if (!session?.user) return null

  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      files: true,
      queueItems: { include: { printer: true }, orderBy: { createdAt: "asc" } },
    },
  })
}
