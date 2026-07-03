"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getAdminStatsAction() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") return null

  const [totalShops, totalUsers, totalOrders, totalRevenue] = await Promise.all([
    prisma.shop.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
  ])

  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  })

  return {
    totalShops,
    totalUsers,
    totalOrders,
    totalRevenue: totalRevenue._sum.total ?? 0,
    ordersByStatus,
  }
}

export async function getShopsAction() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") return []

  return prisma.shop.findMany({
    include: { owner: true, _count: { select: { orders: true, staff: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function updateShopStatusAction(shopId: string, status: string) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

  await prisma.shop.update({ where: { id: shopId }, data: { status: status as never } })

  revalidatePath("/admin/shops")
  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function getUsersAction() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") return []

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, ownedShops: true } } },
  })
}

export async function updateUserRoleAction(userId: string, role: string) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

  await prisma.user.update({ where: { id: userId }, data: { role: role as never } })

  revalidatePath("/admin/users")
  return { success: true }
}

export async function getPlansAction() {
  return prisma.plan.findMany({ orderBy: { price: "asc" } })
}

export async function createPlanAction(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const yearlyPrice = parseFloat(formData.get("yearlyPrice") as string)

  if (!name || !slug || !description || !price || !yearlyPrice) {
    return { error: "All fields are required" }
  }

  await prisma.plan.create({
    data: {
      name,
      slug,
      description,
      price,
      yearlyPrice,
      features: [],
      limits: {},
    },
  })

  revalidatePath("/admin/subscriptions")
  return { success: true }
}

export async function getActivityLogsAction() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") return []

  return prisma.activityLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function getCouponsAction() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") return []

  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
}

export async function createCouponAction(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

  const code = formData.get("code") as string
  const discountType = formData.get("discountType") as string
  const discountValue = parseFloat(formData.get("discountValue") as string)

  if (!code || !discountType || !discountValue) return { error: "All fields are required" }

  await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxUses: formData.get("maxUses") ? parseInt(formData.get("maxUses") as string) : undefined,
    },
  })

  revalidatePath("/admin/coupons")
  return { success: true }
}
