import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const server = await prisma.printServer.findUnique({ where: { token } })
    if (!server) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded?.split(",")[0]?.trim() || "unknown"

    await prisma.printServer.update({
      where: { id: server.id },
      data: { status: "ONLINE", lastSeen: new Date(), ipAddress: ip },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Heartbeat failed" }, { status: 500 })
  }
}
