"use server"

import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function createPaymentIntentAction(amount: number, orderId?: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    let customerId = user?.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || session.user.email!,
        name: user?.name || session.user.name!,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId },
        })
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      customer: customerId,
      metadata: { orderId: orderId || "", userId: session.user.id },
      automatic_payment_methods: { enabled: true },
    })

    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Payment failed" }
  }
}

export async function confirmOrderPaymentAction(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return { status: paymentIntent.status }
  } catch {
    return { error: "Failed to confirm payment" }
  }
}
