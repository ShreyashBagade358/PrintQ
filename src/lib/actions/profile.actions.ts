"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

export async function getProfileAction() {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true, role: true, createdAt: true },
  })
  if (!user) return { error: "User not found" }

  return { user }
}

export async function updateProfileAction(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const validated = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  })
  if (!validated.success) return { error: validated.error.errors[0].message }

  await prisma.user.update({
    where: { id: session.user.id },
    data: validated.data,
  })

  return { success: true }
}

export async function changePasswordAction(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const validated = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  })
  if (!validated.success) return { error: validated.error.errors[0].message }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.password) return { error: "No password set for this account" }

  const isValid = await bcrypt.compare(validated.data.currentPassword, user.password)
  if (!isValid) return { error: "Current password is incorrect" }

  const hashed = await bcrypt.hash(validated.data.newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  })

  return { success: true }
}

export async function getCustomerDashboardAction() {
  const session = await auth()
  if (!session?.user) return null

  let customer = await prisma.customer.findFirst({
    where: { userId: session.user.id },
  })

  if (!customer && session.user.email) {
    customer = await prisma.customer.findFirst({
      where: { email: session.user.email },
    })
    if (customer && !customer.userId) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { userId: session.user.id },
      })
    }
  }

  if (!customer) return { stats: { totalOrders: 0, pagesPrinted: 0, totalSpent: 0, activeOrders: 0 }, recentOrders: [] }

  const [orders, activeOrders, totalPages, totalSpent, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: customer.id },
      include: { shop: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.count({
      where: { customerId: customer.id, status: { in: ["PENDING", "RECEIVED", "IN_QUEUE", "PROCESSING", "PRINTING", "QUALITY_CHECK"] } },
    }),
    prisma.order.aggregate({
      where: { customerId: customer.id },
      _sum: { pages: true },
    }),
    prisma.order.aggregate({
      where: { customerId: customer.id },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: { customerId: customer.id },
    }),
  ])

  return {
    stats: {
      totalOrders,
      pagesPrinted: totalPages._sum.pages ?? 0,
      totalSpent: totalSpent._sum.total ?? 0,
      activeOrders,
    },
    recentOrders: orders,
  }
}