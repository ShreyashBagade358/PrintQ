import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

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

    const body = await req.json().catch(() => null)
    const printers = Array.isArray(body?.printers) ? body.printers : []

    await prisma.printServer.update({
      where: { id: server.id },
      data: {
        printers: printers as Prisma.InputJsonValue,
        status: "ONLINE",
        lastSeen: new Date(),
      },
    })

    return NextResponse.json({ ok: true, count: printers.length })
  } catch {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
