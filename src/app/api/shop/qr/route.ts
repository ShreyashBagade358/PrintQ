import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"
import { generateQrToken, verifyQrToken } from "@/lib/qr-token"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
    select: { id: true, name: true, logo: true, qrToken: true, qrRegeneratedAt: true, status: true },
  })
  if (!shop) return apiError("No shop found", 404)

  let token = shop.qrToken
  if (token && verifyQrToken(token, { ignoreExpiry: true }).valid) {
    // Stored token is healthy — reuse it.
  } else {
    token = generateQrToken(shop.id)
    if (!token) return apiError("QR is not configured. Set NEXTAUTH_SECRET or QR_SECRET.", 500)
    await prisma.shop.update({ where: { id: shop.id }, data: { qrToken: token, qrRegeneratedAt: new Date() } })
  }

  return NextResponse.json({
    shopId: shop.id,
    shopName: shop.name,
    logo: shop.logo,
    qrToken: token,
    regeneratedAt: shop.qrRegeneratedAt?.toISOString() || new Date().toISOString(),
    status: shop.status,
  })
}

export async function POST(req: Request) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER"])
  if (error) return error

  const shop = await prisma.shop.findFirst({
    where: { ownerId: user!.id },
    select: { id: true },
  })
  if (!shop) return apiError("No shop found", 404)

  const token = generateQrToken(shop.id)
  if (!token) return apiError("QR is not configured. Set NEXTAUTH_SECRET or QR_SECRET.", 500)

  await prisma.shop.update({
    where: { id: shop.id },
    data: { qrToken: token, qrRegeneratedAt: new Date() },
  })

  return NextResponse.json({ qrToken: token, regeneratedAt: new Date().toISOString() })
}