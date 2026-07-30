import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shopId, name, secret } = body

    if (typeof shopId !== "string" || shopId.length < 1 || shopId.length > 50) {
      return NextResponse.json({ error: "Invalid shopId" }, { status: 400 })
    }
    if (typeof name !== "string" || name.length < 1 || name.length > 100) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }
    if (typeof secret !== "string") {
      return NextResponse.json({ error: "secret required" }, { status: 400 })
    }

    const expectedSecret = process.env.PRINT_SERVER_SECRET
    if (!expectedSecret) {
      return NextResponse.json({ error: "Print server not configured" }, { status: 500 })
    }

    const secretBuf = Buffer.from(secret)
    const expectedBuf = Buffer.from(expectedSecret)
    if (secretBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(secretBuf, expectedBuf)) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
    }

    const shop = await prisma.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    const existing = await prisma.printServer.findFirst({
      where: { shopId, name },
    })

    if (existing) {
      await prisma.printServer.update({
        where: { id: existing.id },
        data: { status: "ONLINE", lastSeen: new Date() },
      })
      return NextResponse.json({ token: existing.token, serverId: existing.id })
    }

    const token = `psk_${crypto.randomBytes(32).toString("hex")}`

    const server = await prisma.printServer.create({
      data: {
        name,
        token,
        shopId,
        status: "ONLINE",
        lastSeen: new Date(),
      },
    })

    return NextResponse.json({ token: server.token, serverId: server.id })
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
