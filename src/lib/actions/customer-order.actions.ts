"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createNotificationAction } from "./notification.actions"

const customerOrderSchema = z.object({
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
  orientation: z.enum(["portrait", "landscape"]).default("portrait"),
  printQuality: z.enum(["draft", "normal", "high"]).default("normal"),
  pageRange: z.enum(["all", "custom"]).default("all"),
  customPageRange: z.string().optional(),
  finishingOptions: z.array(z.string()).default([]),
  paymentMethod: z.enum(["card", "pay_later"]).default("card"),
  shopId: z.string().optional(),
  files: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string(),
    pages: z.number(),
  })).min(1),
})

export async function createCustomerOrderAction(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const raw = JSON.parse(formData.get("data") as string)
  const validated = customerOrderSchema.safeParse(raw)
  if (!validated.success) return { error: validated.error.errors[0].message }

  const {
    customerEmail, customerName, customerPhone, pages, copies,
    color, paperSize, sides, finishing, notes,
    orientation, printQuality, pageRange, customPageRange, finishingOptions,
    paymentMethod, files, shopId: connectedShopId,
  } = validated.data

  const shop = connectedShopId
    ? await prisma.shop.findUnique({ where: { id: connectedShopId } })
    : await prisma.shop.findFirst()
  if (!shop) return { error: "No shop found. Please contact support." }

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
  } else if (!customer.userId) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { userId: session.user.id },
    })
  }

  const pricingRule = await prisma.pricingRule.findFirst({
    where: { shopId: shop.id, paperSize, colorType: color === "Color" ? "color" : "black_white", isActive: true },
  })

  const basePrice = pricingRule?.pricePerPage ?? (color === "Color" ? 10 : 2)
  const qualityMultiplier = printQuality === "high" ? 1.5 : printQuality === "draft" ? 0.75 : 1
  const amount = Math.round(basePrice * qualityMultiplier * pages * copies * 100) / 100
  const finishingCost = finishingOptions.length * (paperSize === "A3" ? 10 : 5)
  const discount = 0
  const total = amount + finishingCost - discount

  const finishingLabel = finishing || (finishingOptions.length > 0 ? finishingOptions.join(", ") : undefined)

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const order = await prisma.order.create({
    data: {
      orderId,
      pages,
      copies,
      color,
      paperSize,
      sides,
      finishing: finishingLabel,
      amount,
      discount,
      total,
      notes,
      status: paymentMethod === "pay_later" ? "RECEIVED" : "IN_QUEUE",
      printSettings: {
        orientation,
        printQuality,
        pageRange,
        customPageRange: pageRange === "custom" ? customPageRange : undefined,
        finishingOptions,
      },
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

  const staffMembers = await prisma.staff.findMany({
    where: { shopId: shop.id, status: "ACTIVE" },
    select: { userId: true },
  })
  const notifyUserIds = [shop.ownerId, ...staffMembers.map(s => s.userId)]
  await Promise.all(notifyUserIds.map(uid =>
    createNotificationAction(
      uid,
      "New Order Received",
      `Order ${order.orderId} from ${customerName} has been placed.`,
      "ORDER",
      `/shop/orders/${order.id}`,
      shop.id,
    )
  ))

  if (paymentMethod !== "pay_later") {
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
  }

  revalidatePath("/shop/orders")
  revalidatePath("/shop/dashboard")
  revalidatePath("/shop/queue")

  return { success: true, orderId: order.orderId }
}

export async function getTrackOrderAction(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { orderId },
    include: {
      customer: true,
      files: true,
      queueItems: {
        include: { printer: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })
  if (!order) return null
  return {
    id: order.id,
    orderId: order.orderId,
    status: order.status,
    pages: order.pages,
    copies: order.copies,
    color: order.color,
    paperSize: order.paperSize,
    total: order.total,
    estimatedReadyAt: order.estimatedReadyAt?.toISOString() || null,
    completedAt: order.completedAt?.toISOString() || null,
    createdAt: order.createdAt.toISOString(),
    customer: order.customer
      ? { name: order.customer.name, email: order.customer.email, phone: order.customer.phone }
      : null,
    files: order.files.map((f) => ({
      id: f.id, name: f.name, url: f.url, size: f.size, pages: f.pages, type: f.type,
    })),
    queueItems: order.queueItems.map((qi) => ({
      id: qi.id,
      status: qi.status,
      startedAt: qi.startedAt?.toISOString() || null,
      completedAt: qi.completedAt?.toISOString() || null,
      createdAt: qi.createdAt.toISOString(),
      printer: qi.printer ? { id: qi.printer.id, name: qi.printer.name } : null,
    })),
  }
}

export async function getCustomerOrdersAction() {
  const session = await auth()
  if (!session?.user) return []

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

  if (!customer) return []

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { shop: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return orders.map((o) => ({
    id: o.id,
    orderId: o.orderId,
    status: o.status,
    pages: o.pages,
    total: o.total,
    createdAt: o.createdAt.toISOString(),
    shopName: o.shop?.name || null,
  }))
}

export async function getCustomerOrderDetailAction(id: string) {
  const session = await auth()
  if (!session?.user) return null

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      shop: { select: { name: true } },
      customer: true,
      files: true,
      queueItems: {
        include: { printer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!order) return null

  const customer = await prisma.customer.findFirst({
    where: { userId: session.user.id },
  })
  if (!customer && session.user.email) {
    const c = await prisma.customer.findFirst({
      where: { email: session.user.email },
    })
    if (c && !c.userId) {
      await prisma.customer.update({
        where: { id: c.id },
        data: { userId: session.user.id },
      })
    }
  }

  if (order.customerId !== customer?.id && order.customer?.email !== session.user.email) {
    return null
  }

  return {
    id: order.id,
    orderId: order.orderId,
    status: order.status,
    pages: order.pages,
    copies: order.copies,
    color: order.color,
    paperSize: order.paperSize,
    sides: order.sides,
    finishing: order.finishing,
    amount: order.amount,
    discount: order.discount,
    total: order.total,
    notes: order.notes,
    printSettings: order.printSettings as Record<string, unknown> | null,
    estimatedReadyAt: order.estimatedReadyAt?.toISOString() || null,
    completedAt: order.completedAt?.toISOString() || null,
    createdAt: order.createdAt.toISOString(),
    shopName: order.shop?.name || null,
    customer: order.customer
      ? { name: order.customer.name, email: order.customer.email, phone: order.customer.phone }
      : null,
    files: order.files.map((f) => ({
      id: f.id, name: f.name, url: f.url, size: f.size, pages: f.pages, type: f.type,
    })),
    queueItems: order.queueItems.map((qi) => ({
      id: qi.id,
      status: qi.status,
      startedAt: qi.startedAt?.toISOString() || null,
      completedAt: qi.completedAt?.toISOString() || null,
      createdAt: qi.createdAt.toISOString(),
      printer: qi.printer ? { id: qi.printer.id, name: qi.printer.name } : null,
    })),
  }
}
