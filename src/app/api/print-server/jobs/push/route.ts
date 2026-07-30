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

    const body = await req.json()
    const { printerName, fileUrl, fileName, options } = body

    if (!printerName || !fileUrl || !fileName) {
      return NextResponse.json({ error: "printerName, fileUrl, fileName required" }, { status: 400 })
    }

    if (options && typeof options !== "object") {
      return NextResponse.json({ error: "options must be an object" }, { status: 400 })
    }
    if (options && JSON.stringify(options).length > 10_000) {
      return NextResponse.json({ error: "options too large" }, { status: 400 })
    }

    const job = await prisma.printJob.create({
      data: {
        status: "PENDING",
        printerName,
        fileUrl,
        fileName,
        options: (options || undefined) as Prisma.InputJsonValue,
        shopId: server.shopId,
        printServerId: server.id,
      },
    })

    return NextResponse.json({ jobId: job.id })
  } catch {
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
