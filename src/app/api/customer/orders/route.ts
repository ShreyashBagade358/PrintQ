import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

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

export async function GET(req: Request) {
  const { user, error } = requireApiAuth(req)
  if (error) return error

  let customer = await prisma.customer.findFirst({ where: { userId: user!.id } })
  if (!customer && user!.email) {
    customer = await prisma.customer.findFirst({ where: { email: user!.email } })
    if (customer && !customer.userId) {
      await prisma.customer.update({ where: { id: customer.id }, data: { userId: user!.id } })
    }
  }
  if (!customer) return NextResponse.json({ orders: [] })

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { shop: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      orderId: o.orderId,
      status: o.status,
      pages: o.pages,
      total: o.total,
      createdAt: o.createdAt.toISOString(),
      shopName: o.shop?.name || null,
    })),
  })
}

export async function POST(req: Request) {
  const { user, error: authError } = requireApiAuth(req)
  if (authError) return authError

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError("Invalid JSON body")
  }

  const validated = createOrderSchema.safeParse(body)
  if (!validated.success) return apiError(validated.error.errors[0].message, 400)

  const {
    customerEmail, customerName, customerPhone, pages, copies,
    color, paperSize, sides, finishing, notes,
    orientation, printQuality, pageRange, customPageRange, finishingOptions,
    paymentMethod, files, shopId,
  } = validated.data

  const shop = shopId
    ? await prisma.shop.findUnique({ where: { id: shopId } })
    : await prisma.shop.findFirst()
  if (!shop) return apiError("No shop found. Please contact support.")

  if (shop.status !== "ACTIVE") return apiError("This shop is currently inactive.", 403)

  const customer = await prisma.$transaction(async (tx) => {
    let c = await tx.customer.findUnique({
      where: { email_shopId: { email: customerEmail, shopId: shop.id } },
    })
    if (!c) {
      c = await tx.customer.create({
        data: { name: customerName, email: customerEmail, phone: customerPhone, shopId: shop.id, userId: user!.id },
      })
    } else if (!c.userId) {
      c = await tx.customer.update({ where: { id: c.id }, data: { userId: user!.id } })
    }
    return c
  })

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
      userId: user!.id,
      shopId: shop.id,
      files: { create: files.map((f) => ({ name: f.name, url: f.url, size: f.size, type: f.type, pages: f.pages })) },
    },
  })

  const staffMembers = await prisma.staff.findMany({
    where: { shopId: shop.id, status: "ACTIVE" },
    select: { userId: true },
  })
  const notifyUserIds = [shop.ownerId, ...staffMembers.map((s) => s.userId)]
  await Promise.all(
    notifyUserIds.map((uid) =>
      prisma.notification.create({
        data: {
          userId: uid,
          title: "New Order Received",
          message: `Order ${order.orderId} from ${customerName} has been placed.`,
          type: "ORDER",
          link: `/shop/orders/${order.id}`,
          shopId: shop.id,
        },
      })
    )
  )

  if (paymentMethod !== "pay_later") {
    await prisma.$transaction(async (tx) => {
      const count = await tx.queueItem.count({ where: { shopId: shop.id } })
      await tx.queueItem.create({
        data: { position: count + 1, status: "QUEUED", shopId: shop.id, orderId: order.id },
      })
      await tx.customer.update({
        where: { id: customer.id },
        data: { totalOrders: { increment: 1 }, totalSpent: { increment: total } },
      })
    })
  }

  return NextResponse.json({ success: true, orderId: order.orderId, id: order.id }, { status: 201 })
}