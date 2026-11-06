import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  dispatchAutomationOrder,
  ensureAutomationPlan,
  activateAutomationAfterPayment,
} from "@/lib/automation"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

  const { getStripeInstance } = await import("@/lib/stripe")
  const stripe = getStripeInstance()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      const shopId = session.metadata?.shopId
      const planId = session.metadata?.planId

      if (shopId && planId) {
        const periodStart = new Date()
        const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        await prisma.subscription.upsert({
          where: { shopId },
          update: {
            planId,
            status: "ACTIVE",
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          },
          create: {
            shopId,
            planId,
            status: "ACTIVE",
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          },
        })

        if (session.metadata?.feature === "automation") {
          await ensureAutomationPlan()
          await activateAutomationAfterPayment(shopId, session.metadata?.printerName || null).catch(() => {})
        }
      }
      break
    }

    case "payment_intent.succeeded": {
      const intent = event.data.object
      const orderId = intent.metadata?.orderId
      if (!orderId) break

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, shopId: true, paymentStatus: true },
      })
      if (!order || order.paymentStatus === "PAID") break

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", paidAt: new Date() },
      })
      await dispatchAutomationOrder(order.shopId, order.id).catch(() => {})
      break
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object
      const orderId = intent.metadata?.orderId
      if (!orderId) break

      await prisma.order.updateMany({
        where: { id: orderId, paymentStatus: "PENDING" },
        data: { paymentStatus: "FAILED" },
      })
      break
    }

    case "invoice.paid": {
      const invoice = event.data.object
      const subscriptionId = invoice.subscription as string

      if (subscriptionId) {
        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        })

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              currentPeriodStart: new Date(invoice.period_start * 1000),
              currentPeriodEnd: new Date(invoice.period_end * 1000),
              status: "ACTIVE",
            },
          })

          const invoiceData = {
            amount: invoice.amount_paid / 100,
            status: "PAID" as const,
            dueDate: new Date(invoice.period_end * 1000),
            paidAt: new Date(),
            stripeInvoiceId: invoice.id,
            shopId: sub.shopId,
          }
          await prisma.invoice.upsert({
            where: { invoiceId: `INV-${invoice.id}` },
            update: invoiceData,
            create: { invoiceId: `INV-${invoice.id}`, ...invoiceData },
          })
        }
      }
      break
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object
      const status = subscription.status === "active" ? "ACTIVE"
        : subscription.status === "past_due" ? "PAST_DUE"
        : subscription.status === "canceled" ? "CANCELLED"
        : "EXPIRED"

      const existing = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        select: { shopId: true },
      })

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: status as never },
      })

      if (existing && status !== "ACTIVE") {
        await prisma.shop.update({
          where: { id: existing.shopId },
          data: { autoWorkflowEnabled: false },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
