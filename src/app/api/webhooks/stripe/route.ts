import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

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
        await prisma.subscription.create({
          data: {
            shopId,
            planId,
            status: "ACTIVE",
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })
      }
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

          await prisma.invoice.create({
            data: {
              invoiceId: `INV-${invoice.id}`,
              amount: invoice.amount_paid / 100,
              status: "PAID",
              dueDate: new Date(invoice.period_end * 1000),
              paidAt: new Date(),
              stripeInvoiceId: invoice.id,
              shopId: sub.shopId,
            },
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

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: status as never },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
