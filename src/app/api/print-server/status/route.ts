import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return NextResponse.json({ servers: [] })

  const servers = await prisma.printServer.findMany({
    where: { shopId: shop.id },
    orderBy: { lastSeen: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      lastSeen: true,
      ipAddress: true,
    },
  })

  const now = Date.now()
  const result = servers.map((s) => {
    const lastSeenMs = s.lastSeen ? now - new Date(s.lastSeen).getTime() : Infinity
    const isAlive = s.status === "ONLINE" && lastSeenMs < 2 * 60 * 1000
    return {
      ...s,
      isAlive,
      lastSeenMs,
    }
  })

  const anyAlive = result.some((s) => s.isAlive)

  return NextResponse.json({
    connected: anyAlive,
    servers: result,
  })
}
