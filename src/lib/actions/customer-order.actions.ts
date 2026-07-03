"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

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
    files, shopId: connectedShopId,
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
      status: "IN_QUEUE",
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
