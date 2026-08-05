import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function getActivePrintServerForShop(shopId: string) {
  return prisma.printServer.findFirst({
    where: {
      shopId,
      status: "ONLINE",
      lastSeen: { gte: new Date(Date.now() - 2 * 60 * 1000) },
    },
    orderBy: { lastSeen: "desc" },
  })
}

export interface SyncedPrinter {
  name: string
  status: string
  model: string
  ip: string | null
  uri: string | null
  capabilities: { color: boolean; duplex: boolean; paperSizes: string[] }
  inkLevel: number | null
  source: string
}

export async function getSyncedPrinters(shopId: string): Promise<SyncedPrinter[]> {
  const server = await getActivePrintServerForShop(shopId)
  if (!server?.printers || !Array.isArray(server.printers)) return []
  return server.printers as unknown as SyncedPrinter[]
}

export async function createPrintJob(data: {
  shopId: string
  printerName: string
  fileUrl: string
  fileName: string
  options?: Record<string, unknown>
  printServerId: string
}) {
  return prisma.printJob.create({
    data: {
      status: "PENDING",
      printerName: data.printerName,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      options: (data.options ?? undefined) as Prisma.InputJsonValue,
      shopId: data.shopId,
      printServerId: data.printServerId,
    },
  })
}

export async function updatePrintJobStatus(
  jobId: string,
  status: string,
  result?: { error?: string; jobId?: string }
) {
  return prisma.printJob.update({
    where: { id: jobId },
    data: {
      status,
      error: result?.error,
      jobId: result?.jobId,
    },
  })
}

export async function claimPendingPrintJobs(printServerId: string) {
  return prisma.$transaction(async (tx) => {
    const pending = await tx.printJob.findMany({
      where: { printServerId, status: "PENDING" },
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
}

export async function getPendingPrintJobs(printServerId: string) {
  return prisma.printJob.findMany({
    where: { printServerId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 10,
  })
}
