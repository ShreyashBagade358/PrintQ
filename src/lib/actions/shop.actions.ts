"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const updateShopSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pinCode: z.string().min(4).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  timezone: z.string().optional(),
  autoDeleteDays: z.number().min(1).max(90).optional(),
})

export async function getShopAction() {
  const session = await auth()
  if (!session?.user) return null

  return prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
    include: {
      staff: { include: { user: true } },
      printers: true,
      pricingRules: true,
      subscriptions: { include: { plan: true } },
    },
  })
}

export async function updateShopAction(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({ where: { ownerId: session.user.id } })
  if (!shop) return { error: "No shop found" }

  const raw: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    raw[key] = value
  }

  const validated = updateShopSchema.safeParse(raw)
  if (!validated.success) return { error: validated.error.errors[0].message }

  await prisma.shop.update({ where: { id: shop.id }, data: validated.data })

  revalidatePath("/shop/settings")
  revalidatePath("/shop/profile")
  return { success: true }
}

export async function getStaffMembersAction() {
  const session = await auth()
  if (!session?.user) return []

  const shop = await prisma.shop.findFirst({ where: { ownerId: session.user.id } })
  if (!shop) return []

  return prisma.staff.findMany({
    where: { shopId: shop.id },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function inviteStaffAction(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({ where: { ownerId: session.user.id } })
  if (!shop) return { error: "No shop found" }

  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const role = (formData.get("role") as string) || "staff"

  if (!email || !name) return { error: "Email and name are required" }

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: { name, email, role: "STAFF" },
    })
  }

  const existing = await prisma.staff.findUnique({
    where: { userId_shopId: { userId: user.id, shopId: shop.id } },
  })
  if (existing) return { error: "Staff member already exists" }

  await prisma.staff.create({
    data: {
      userId: user.id,
      shopId: shop.id,
      role,
      permissions: ["view_orders", "update_orders"],
      status: "ACTIVE",
    },
  })

  revalidatePath("/shop/staff")
  return { success: true }
}

export async function createCustomerAction(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return { error: "No shop found" }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string

  if (!name || !email) return { error: "Name and email are required" }

  const existing = await prisma.customer.findUnique({
    where: { email_shopId: { email, shopId: shop.id } },
  })
  if (existing) return { error: "Customer with this email already exists" }

  await prisma.customer.create({
    data: { name, email, phone, shopId: shop.id },
  })

  revalidatePath("/shop/customers")
  return { success: true }
}

export async function removeStaffAction(staffId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({ where: { ownerId: session.user.id } })
  if (!shop) return { error: "No shop found" }

  await prisma.staff.delete({ where: { id: staffId } })

  revalidatePath("/shop/staff")
  return { success: true }
}

export async function getCustomersAction(search?: string) {
  const session = await auth()
  if (!session?.user) return []

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return []

  const where: Record<string, unknown> = { shopId: shop.id }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  return prisma.customer.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function getQueueAction() {
  const session = await auth()
  if (!session?.user) return []

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return []

  return prisma.queueItem.findMany({
    where: { shopId: shop.id, status: { in: ["QUEUED", "PRINTING"] } },
    include: { order: { include: { customer: true } }, printer: true },
    orderBy: [{ priority: "desc" }, { position: "asc" }],
  })
}

export async function getShopProfileStatsAction() {
  const session = await auth()
  if (!session?.user) return null

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return null

  const [totalOrders, totalSpent] = await Promise.all([
    prisma.order.count({ where: { shopId: shop.id } }),
    prisma.order.aggregate({ where: { shopId: shop.id }, _sum: { total: true } }),
  ])

  return {
    totalOrders,
    totalSpent: totalSpent._sum.total ?? 0,
  }
}
