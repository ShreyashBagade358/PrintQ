import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"
import { getStripeInstance } from "@/lib/stripe"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const { user, error } = requireApiAuth(req)
  if (error) return error

  let body: { amount?: number; orderId?: string }
  try {
    body = await req.json()
  } catch {
    return apiError("Invalid JSON body")
  }

  const amount = body.amount
  if (typeof amount !== "number" || amount <= 0 || amount > 1000000) {
    return apiError("Invalid amount")
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user!.id } })

    const stripe = getStripeInstance()
    let customerId = dbUser?.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser?.email || user!.email,
        name: dbUser?.name || user!.name,
        metadata: { userId: user!.id },
      })
      customerId = customer.id
      if (dbUser) {
        await prisma.user.update({ where: { id: dbUser.id }, data: { stripeCustomerId: customerId } })
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      customer: customerId,
      metadata: { orderId: body.orderId || "", userId: user!.id },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id })
  } catch {
    return apiError("Payment failed", 500)
  }
}