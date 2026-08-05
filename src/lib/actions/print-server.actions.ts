"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getSyncedPrinters } from "@/lib/print-server-utils"
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

export async function discoverBridgePrintersAction() {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const userId = session.user.id

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: userId }, { staff: { some: { userId } } }] },
  })
  if (!shop) {
    const owned = await prisma.shop.count({ where: { ownerId: userId } })
    console.error("[discoverBridgePrintersAction] no shop for user", {
      email: session.user.email,
      role: session.user.role,
      userId,
      shopsOwned: owned,
    })
    return {
      error: `Your account (${session.user.email}) has no shop linked in this app. Log in with the account that owns the shop, or create/link a shop for this account.`,
    }
  }

  const server = await prisma.printServer.findFirst({
    where: { shopId: shop.id },
    orderBy: { lastSeen: "desc" },
  })

  const printers = await getSyncedPrinters(shop.id)
  if (!server || server.status !== "ONLINE" || !server.lastSeen || Date.now() - server.lastSeen.getTime() > 2 * 60 * 1000) {
    return {
      error:
        "No online print server. Make sure the print server (node print-server.js) is running on the computer connected to your printers, then try again.",
    }
  }
  if (printers.length === 0) {
    return {
      error:
        "Print server is online, but no printers were discovered. Check that the printers are powered on and connected to the same WiFi as the server.",
    }
  }

  return {
    printers: printers.map((p) => ({
      name: p.name,
      model: p.model,
      status: p.status,
    })),
  }
}
