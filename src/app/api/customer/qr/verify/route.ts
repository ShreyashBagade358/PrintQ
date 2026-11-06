import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"
import { verifyQrToken } from "@/lib/qr-token"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const { user, error } = requireApiAuth(req)
  if (error) return error

  let body: { token?: string }
  try {
    body = await req.json()
  } catch {
    return apiError("Invalid JSON body")
  }

  const token = body.token
  if (!token) return apiError("QR token is required")

  const verified = verifyQrToken(token, { ignoreExpiry: true })
  if (!verified.valid) return NextResponse.json({ valid: false, error: verified.error || "Invalid QR code" })

  const shop = await prisma.shop.findUnique({
    where: { id: verified.shopId },
    select: {
      id: true, name: true, slug: true, logo: true, address: true, city: true, state: true,
      phone: true, email: true, status: true, qrToken: true,
    },
  })

  if (!shop) return NextResponse.json({ valid: false, error: "Shop not found" })
  if (shop.status !== "ACTIVE") return NextResponse.json({ valid: false, error: "This shop is currently inactive" })
  if (shop.qrToken !== token) {
    return NextResponse.json({ valid: false, error: "This QR code has been regenerated. Please scan the new one." })
  }

  try {
    await prisma.scanEvent.create({
      data: { shopId: shop.id, userId: user!.id, token, metadata: { via: "api" } },
    })
  } catch {
    // Non-critical — don't block the scan flow
  }

  return NextResponse.json({ valid: true, shop })
}