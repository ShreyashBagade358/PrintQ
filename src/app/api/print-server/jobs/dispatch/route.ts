import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
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

    const claimedJobs = await prisma.$transaction(async (tx) => {
      const pending = await tx.printJob.findMany({
        where: { printServerId: server.id, status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: 10,
      })
      if (pending.length === 0) return []
      const ids = pending.map((j) => j.id)
      await tx.printJob.updateMany({
        where: { id: { in: ids }, status: "PENDING" },
        data: { status: "CLAIMED" },
      })
      return pending
    })

    return NextResponse.json({ jobs: claimedJobs })
  } catch {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}
