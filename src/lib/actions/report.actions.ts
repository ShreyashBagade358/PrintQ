"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getMonthlySalesReportAction(month: number, year: number) {
  const session = await auth()
  if (!session?.user) return null

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return null

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const orders = await prisma.order.findMany({
    where: { shopId: shop.id, createdAt: { gte: startDate, lte: endDate } },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  })

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const totalPages = orders.reduce((sum, o) => sum + o.pages, 0)
  const colorOrders = orders.filter((o) => o.color === "COLOR").length
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length

  return {
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
  }
}

export async function getOrderSummaryAction(days: number) {
  const session = await auth()
  if (!session?.user) return null

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return null

  const since = new Date()
  since.setDate(since.getDate() - days)

  const orders = await prisma.order.findMany({
    where: { shopId: shop.id, createdAt: { gte: since } },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  })

  const statusBreakdown: Record<string, number> = {}
  orders.forEach((o) => {
    statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1
  })

  const dailyData: Record<string, { orders: number; revenue: number }> = {}
  orders.forEach((o) => {
    const day = o.createdAt.toISOString().slice(0, 10)
    if (!dailyData[day]) dailyData[day] = { orders: 0, revenue: 0 }
    dailyData[day].orders++
    dailyData[day].revenue += Number(o.total)
  })

  return {
    days,
    summary: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + Number(o.total), 0),
      totalPages: orders.reduce((s, o) => s + o.pages, 0),
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
  }
}

export async function getCustomerReportAction() {
  const session = await auth()
  if (!session?.user) return null

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return null

  const customers = await prisma.customer.findMany({
    where: { shopId: shop.id },
    include: { _count: { select: { orders: true } } },
    orderBy: { totalSpent: "desc" },
    take: 50,
  })

  return {
    totalCustomers: customers.length,
    topCustomers: customers.slice(0, 10).map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      totalOrders: c.totalOrders,
      totalSpent: Number(c.totalSpent),
    })),
    allCustomers: customers.map((c) => ({
      name: c.name,
      email: c.email,
      orders: c._count.orders,
      spent: Number(c.totalSpent),
    })),
  }
}

export async function getCustomReportDataAction(type: string, dateRange: string) {
  const session = await auth()
  if (!session?.user) return null

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return null

  let since = new Date()
  switch (dateRange) {
    case "Last 7 days": since.setDate(since.getDate() - 7); break
    case "Last 30 days": since.setDate(since.getDate() - 30); break
    case "Last quarter": since.setMonth(since.getMonth() - 3); break
    default: since.setDate(since.getDate() - 7)
  }

  if (type === "Orders") {
    const orders = await prisma.order.findMany({
      where: { shopId: shop.id, createdAt: { gte: since } },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    })
    return {
      type: "Orders",
      dateRange,
      generatedAt: new Date().toISOString(),
      data: orders.map((o) => ({
        "Order ID": o.orderId,
        "Customer": o.customer?.name || "Walk-in",
        "Pages": String(o.pages),
        "Amount": `₹${Number(o.total).toFixed(2)}`,
        "Status": o.status,
        "Date": o.createdAt.toLocaleDateString(),
      })),
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((s, o) => s + Number(o.total), 0),
        totalPages: orders.reduce((s, o) => s + o.pages, 0),
      },
    }
  }

  if (type === "Revenue") {
    const orders = await prisma.order.findMany({
      where: { shopId: shop.id, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    })
    const daily: Record<string, number> = {}
    orders.forEach((o) => {
      const day = o.createdAt.toISOString().slice(0, 10)
      daily[day] = (daily[day] || 0) + Number(o.total)
    })
    return {
      type: "Revenue",
      dateRange,
      generatedAt: new Date().toISOString(),
      data: Object.entries(daily).map(([date, amount]) => ({
        "Date": date,
        "Revenue": `₹${amount.toFixed(2)}`,
        "Orders": String(orders.filter((o) => o.createdAt.toISOString().slice(0, 10) === date).length),
      })),
      summary: {
        totalRevenue: orders.reduce((s, o) => s + Number(o.total), 0),
        totalOrders: orders.length,
      },
    }
  }

  if (type === "Customers") {
    const customers = await prisma.customer.findMany({
      where: { shopId: shop.id },
      orderBy: { totalSpent: "desc" },
    })
    return {
      type: "Customers",
      dateRange,
      generatedAt: new Date().toISOString(),
      data: customers.map((c) => ({
        "Name": c.name,
        "Email": c.email || "-",
        "Phone": c.phone || "-",
        "Orders": String(c.totalOrders),
        "Total Spent": `₹${Number(c.totalSpent).toFixed(2)}`,
      })),
      summary: {
        totalCustomers: customers.length,
        totalRevenue: customers.reduce((s, c) => s + Number(c.totalSpent), 0),
      },
    }
  }

  if (type === "Printers") {
    const printers = await prisma.printer.findMany({
      where: { shopId: shop.id },
      include: { _count: { select: { queueItems: true } } },
    })
    return {
      type: "Printers",
      dateRange,
      generatedAt: new Date().toISOString(),
      data: printers.map((p) => ({
        "Name": p.name,
        "Model": p.model,
        "Status": p.status,
        "Paper Level": `${p.paperLevel}%`,
        "Ink Level": `${p.inkLevel}%`,
        "Jobs": String(p._count.queueItems),
      })),
      summary: {
        totalPrinters: printers.length,
        onlinePrinters: printers.filter((p) => p.status === "ONLINE").length,
      },
    }
  }

  return null
}
