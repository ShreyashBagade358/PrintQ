import { NextResponse } from "next/server"
import { requireApiAuth, apiError } from "@/lib/api-auth"
import { getStripeInstance } from "@/lib/stripe"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const { user, error } = requireApiAuth(req)
  if (error) return error

  let body: { paymentIntentId?: string }
  try {
    body = await req.json()
  } catch {
    return apiError("Invalid JSON body")
  }

  const paymentIntentId = body.paymentIntentId
  if (!paymentIntentId) return apiError("paymentIntentId is required")

  try {
    const stripe = getStripeInstance()
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.metadata.userId !== user!.id && user!.role !== "SHOP_OWNER") {
      return apiError("Unauthorized", 403)
    }

    return NextResponse.json({ status: paymentIntent.status })
  } catch {
    return apiError("Failed to confirm payment", 500)
  }
}