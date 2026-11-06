"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getStripeInstance } from "@/lib/stripe"
import {
  ensureAutomationPlan,
  getAutomationOverview,
  isAutomationPremium,
  processAutomationBacklog,
} from "@/lib/automation"
import {
  getActivePrintServerForShop,
  getSyncedPrinters,
} from "@/lib/print-server-utils"

async function getOwnerShop(userId: string) {
  return prisma.shop.findFirst({
    where: { ownerId: userId },
    select: { id: true, name: true },
  })
}

export async function getAutomationPanelAction() {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" as const }

  const shop = await prisma.shop.findFirst({
    where: {
      OR: [
        { ownerId: session.user.id },
        { staff: { some: { userId: session.user.id } } },
      ],
    },
    select: { id: true },
  })
  if (!shop) return { error: "No shop found" as const }

  const overview = await getAutomationOverview(shop.id)
  if (!overview) return { error: "No shop found" as const }

  return { success: true as const, data: overview }
}

export async function startAutomationCheckoutAction(input?: {
  printerName?: string | null
}) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await getOwnerShop(session.user.id)
  if (!shop) return { error: "Only the shop owner can manage billing" }

  if (await isAutomationPremium(shop.id)) {
    return { error: "Automation Premium is already active" }
  }

  const synced = await getSyncedPrinters(shop.id)
  const online = synced.filter(
    (p) => p.status === "ONLINE" || p.status === "IDLE",
  )
  const printerName =
    input?.printerName && online.some((p) => p.name === input.printerName)
      ? input.printerName
      : null

  try {
    await ensureAutomationPlan()
    const stripe = getStripeInstance()
    const plan = await prisma.plan.findUnique({
      where: { slug: "automation-premium" },
    })
    if (!plan) return { error: "Automation plan is unavailable" }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    let customerId = user?.stripeCustomerId || null
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || session.user.email || undefined,
        name: user?.name || session.user.name || undefined,
        metadata: { userId: session.user.id, shopId: shop.id },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    await prisma.shop.update({
      where: { id: shop.id },
      data: { autoWorkflowPrinterName: printerName },
    })

    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ).replace(/\/$/, "")

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: shop.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: Math.round(plan.price * 100),
            recurring: { interval: "month" },
            product_data: {
              name: plan.name,
              description: plan.description,
            },
          },
        },
      ],
      metadata: {
        shopId: shop.id,
        planId: plan.id,
        feature: "automation",
        printerName: printerName || "",
      },
      subscription_data: {
        metadata: {
          shopId: shop.id,
          planId: plan.id,
          feature: "automation",
          printerName: printerName || "",
        },
      },
      success_url: `${baseUrl}/shop/settings?tab=automation&checkout=success`,
      cancel_url: `${baseUrl}/shop/settings?tab=automation&checkout=cancelled`,
    })

    if (!checkout.url) return { error: "Could not start checkout" }
    return { url: checkout.url }
  } catch {
    return { error: "Could not start checkout. Please try again." }
  }
}

export async function enableAutomationAction(input: {
  skipQC?: boolean
  printerName?: string | null
}) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await getOwnerShop(session.user.id)
  if (!shop) return { error: "Only the shop owner can enable automation" }

  if (!(await isAutomationPremium(shop.id))) {
    return { error: "Automation Premium subscription required" }
  }

  const server = await getActivePrintServerForShop(shop.id)
  if (!server) {
    return { error: "Start the Print Server before enabling automation" }
  }

  const synced = await getSyncedPrinters(shop.id)
  const online = synced.filter(
    (p) => p.status === "ONLINE" || p.status === "IDLE",
  )
  if (online.length === 0) {
    return { error: "No online printer found for this shop" }
  }

  const printerName =
    input.printerName && online.some((p) => p.name === input.printerName)
      ? input.printerName
      : null

  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      autoWorkflowEnabled: true,
      autoWorkflowSkipQC: input.skipQC ?? false,
      autoWorkflowPrinterName: printerName,
      autoWorkflowActivatedAt: new Date(),
    },
  })

  await processAutomationBacklog(shop.id).catch(() => {})

  revalidatePath("/shop/settings")
  revalidatePath("/shop/dashboard")
  revalidatePath("/shop/queue")
  return { success: true }
}

export async function disableAutomationAction() {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await getOwnerShop(session.user.id)
  if (!shop) return { error: "Only the shop owner can change automation" }

  await prisma.shop.update({
    where: { id: shop.id },
    data: { autoWorkflowEnabled: false },
  })

  revalidatePath("/shop/settings")
  revalidatePath("/shop/dashboard")
  return { success: true }
}

export async function updateAutomationSettingsAction(input: {
  skipQC: boolean
  printerName?: string | null
}) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await getOwnerShop(session.user.id)
  if (!shop) return { error: "Only the shop owner can change automation" }

  if (!(await isAutomationPremium(shop.id))) {
    return { error: "Automation Premium subscription required" }
  }

  const synced = await getSyncedPrinters(shop.id)
  const online = synced.filter(
    (p) => p.status === "ONLINE" || p.status === "IDLE",
  )
  const printerName =
    input.printerName && online.some((p) => p.name === input.printerName)
      ? input.printerName
      : null

  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      autoWorkflowSkipQC: input.skipQC,
      autoWorkflowPrinterName: printerName,
    },
  })

  revalidatePath("/shop/settings")
  return { success: true }
}
