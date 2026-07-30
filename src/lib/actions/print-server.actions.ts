"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import crypto from "crypto"

export async function registerPrintServerAction(name: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return { error: "No shop found" }

  const existing = await prisma.printServer.findFirst({
    where: { shopId: shop.id, name },
  })
  if (existing) return { error: "A print server with this name already exists" }

  const token = `psk_${crypto.randomBytes(32).toString("hex")}`

  const server = await prisma.printServer.create({
    data: {
      name,
      token,
      shopId: shop.id,
      status: "ONLINE",
      lastSeen: new Date(),
    },
  })

  return { success: true, token: server.token, serverId: server.id }
}

export async function getPrintServersAction() {
  const session = await auth()
  if (!session?.user) return []

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return []

  return prisma.printServer.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function deletePrintServerAction(serverId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return { error: "No shop found" }

  const server = await prisma.printServer.findFirst({
    where: { id: serverId, shopId: shop.id },
  })
  if (!server) return { error: "Print server not found" }

  await prisma.printServer.delete({ where: { id: serverId } })

  return { success: true }
}
