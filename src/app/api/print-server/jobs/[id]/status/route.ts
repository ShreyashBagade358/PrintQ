import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleAutomationPrintJobUpdate } from "@/lib/automation"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const job = await prisma.printJob.findUnique({ where: { id } })
    if (!job || job.printServerId !== server.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const body = await req.json()
    const { status, error, jobId } = body

    if (!["CLAIMED", "PRINTING", "COMPLETED", "FAILED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await prisma.printJob.update({
      where: { id },
      data: { status, error, jobId },
    })

    await handleAutomationPrintJobUpdate(id, status, error).catch(() => {})

    if (status === "COMPLETED" || status === "FAILED") {
      const order = await prisma.order.findFirst({
        where: {
          shopId: server.shopId,
          files: { some: { name: job.fileName, url: job.fileUrl } },
        },
        orderBy: { createdAt: "desc" },
      })

      if (order) {
        const currentNotes = order.printNotes || ""
        const resultLine = `${job.fileName}: ${status === "COMPLETED" ? `job ${jobId || "done"}` : `failed (${error || "unknown"})`}`
        await prisma.order.update({
          where: { id: order.id },
          data: { printNotes: `${currentNotes}\n${resultLine}`.trim() },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
