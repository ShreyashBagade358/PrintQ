"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateQrToken, verifyQrToken } from "@/lib/qr-token"

export async function getShopQrAction() {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
    select: { id: true, name: true, logo: true, qrToken: true, qrRegeneratedAt: true, status: true },
  })
  if (!shop) return { error: "No shop found" }

  let token = shop.qrToken
  if (!token) {
    token = generateQrToken(shop.id)
    await prisma.shop.update({ where: { id: shop.id }, data: { qrToken: token, qrRegeneratedAt: new Date() } })
  }

  return {
    shopId: shop.id,
    shopName: shop.name,
    logo: shop.logo,
    qrToken: token,
    regeneratedAt: shop.qrRegeneratedAt?.toISOString() || new Date().toISOString(),
    status: shop.status,
  }
}

export async function regenerateQrAction() {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
    select: { id: true },
  })
  if (!shop) return { error: "No shop found" }

  const token = generateQrToken(shop.id)
  await prisma.shop.update({
    where: { id: shop.id },
    data: { qrToken: token, qrRegeneratedAt: new Date() },
  })

  return { qrToken: token, regeneratedAt: new Date().toISOString() }
}

export async function verifyShopQrAction(token: string) {
  const verified = verifyQrToken(token)
  if (!verified.valid) return { valid: false, error: verified.error || "Invalid QR code" }

  const shop = await prisma.shop.findUnique({
    where: { id: verified.shopId },
    select: {
      id: true, name: true, slug: true, logo: true, address: true, city: true, state: true,
      phone: true, email: true, status: true, qrToken: true,
    },
  })

  if (!shop) return { valid: false, error: "Shop not found" }
  if (shop.status !== "ACTIVE") return { valid: false, error: "This shop is currently inactive" }
  if (shop.qrToken !== token) return { valid: false, error: "This QR code has been regenerated. Please scan the new one." }

  return { valid: true, shop }
}
