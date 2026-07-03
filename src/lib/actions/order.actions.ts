"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const createOrderSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  pages: z.number().min(1),
  copies: z.number().min(1),
  color: z.string(),
  paperSize: z.string(),
  sides: z.string(),
  finishing: z.string().optional(),
  notes: z.string().optional(),
  files: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string(),
    pages: z.number(),
  })).min(1),
})

export async function createOrderAction(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!shop) return { error: "No shop found" }

  const data = JSON.parse(formData.get("data") as string)
  const validated = createOrderSchema.safeParse(data)
  if (!validated.success) return { error: validated.error.errors[0].message }

  const { customerEmail, customerName, customerPhone, pages, copies, color, paperSize, sides, finishing, notes, files } = validated.data

  let customer = await prisma.customer.findUnique({
    where: { email_shopId: { email: customerEmail, shopId: shop.id } },
  })

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        shopId: shop.id,
        userId: session.user.id,
      },
    })
  }

  const pricingRule = await prisma.pricingRule.findFirst({
    where: { shopId: shop.id, paperSize, colorType: color, isActive: true },
  })

  const pricePerPage = pricingRule?.pricePerPage ?? (color === "Color" ? 10 : 2)
  const amount = pricePerPage * pages * copies
  const discount = 0
  const total = amount - discount

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const order = await prisma.order.create({
    data: {
      orderId,
      pages,
      copies,
      color,
      paperSize,
      sides,
      finishing,
      amount,
      discount,
      total,
      notes,
      status: "IN_QUEUE",
      customerId: customer.id,
      userId: session.user.id,
      shopId: shop.id,
      files: {
        create: files.map((f) => ({
          name: f.name,
          url: f.url,
          size: f.size,
          type: f.type,
          pages: f.pages,
        })),
      },
    },
  })

  await prisma.queueItem.create({
    data: {
      position: (await prisma.queueItem.count({ where: { shopId: shop.id } })) + 1,
      status: "QUEUED",
      shopId: shop.id,
      orderId: order.id,
    },
  })

  await prisma.customer.update({
    where: { id: customer.id },
    data: { totalOrders: { increment: 1 }, totalSpent: { increment: total } },
  })

  revalidatePath("/shop/orders")
  revalidatePath("/shop/dashboard")
  revalidatePath("/shop/queue")

  return { success: true, orderId: order.orderId }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return { error: "Order not found" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop || order.shopId !== shop.id) return { error: "Unauthorized" }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as never,
      completedAt: status === "COMPLETED" ? new Date() : undefined,
      estimatedReadyAt: status === "IN_QUEUE" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
    },
  })

  if (status === "COMPLETED" || status === "CANCELLED") {
    await prisma.queueItem.updateMany({
      where: { orderId, status: "QUEUED" },
      data: { status: "COMPLETED" },
    })
  }

  revalidatePath("/shop/orders")
  revalidatePath(`/shop/orders/${orderId}`)
  revalidatePath("/shop/queue")
  revalidatePath("/shop/dashboard")

  return { success: true }
}

export async function getOrdersAction(shopId: string, status?: string) {
  const session = await auth()
  if (!session?.user) return []

  const where: Record<string, unknown> = { shopId }
  if (status && status !== "all") where.status = status

  return prisma.order.findMany({
    where: where as never,
    include: { customer: true, files: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getOrderDetailAction(orderId: string) {
  const session = await auth()
  if (!session?.user) return null

  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      files: true,
      queueItems: { include: { printer: true } },
    },
  })
}
