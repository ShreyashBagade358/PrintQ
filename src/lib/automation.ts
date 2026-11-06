import { prisma } from "@/lib/prisma"
import {
  getActivePrintServerForShop,
  getSyncedPrinters,
  type SyncedPrinter,
} from "@/lib/print-server-utils"

export const AUTOMATION_PLAN_SLUG = "automation-premium"
export const AUTOMATION_PRICE_INR = Number(process.env.AUTOMATION_PRICE_INR || 499)

const MAX_AUTOMATION_ATTEMPTS = 2

export interface AutomationPrinterOption {
  name: string
  model: string
  color: boolean
  duplex: boolean
  paperSizes: string[]
}

export async function ensureAutomationPlan() {
  return prisma.plan.upsert({
    where: { slug: AUTOMATION_PLAN_SLUG },
    update: {
      automation: true,
      isActive: true,
      price: AUTOMATION_PRICE_INR,
      yearlyPrice: Math.round(AUTOMATION_PRICE_INR * 12 * 0.85),
    },
    create: {
      name: "Automation Premium",
      slug: AUTOMATION_PLAN_SLUG,
      description:
        "Hands-free printing. Every paid order is queued, printed and completed automatically.",
      price: AUTOMATION_PRICE_INR,
      yearlyPrice: Math.round(AUTOMATION_PRICE_INR * 12 * 0.85),
      features: [
        "Automatic print dispatch",
        "Printer auto-selection",
        "Automatic order completion",
        "Owner alerts on failures",
      ],
      limits: {},
      automation: true,
    },
  })
}

export async function getAutomationSubscription(shopId: string) {
  return prisma.subscription.findFirst({
    where: {
      shopId,
      status: "ACTIVE",
      currentPeriodEnd: { gt: new Date() },
      plan: { automation: true },
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function isAutomationPremium(shopId: string) {
  return Boolean(await getAutomationSubscription(shopId))
}

function printerOptions(printers: SyncedPrinter[]): AutomationPrinterOption[] {
  return printers.map((p) => ({
    name: p.name,
    model: p.model || "Unknown",
    color: p.capabilities?.color ?? true,
    duplex: p.capabilities?.duplex ?? true,
    paperSizes: p.capabilities?.paperSizes ?? [],
  }))
}

function capable<
  T extends { color: boolean; duplex: boolean; paperSizes: string[] },
>(printer: T, order: { color: string; sides: string; paperSize: string }) {
  if (order.color === "Color" && !printer.color) return false
  if (order.sides === "Double Sided" && !printer.duplex) return false
  if (
    printer.paperSizes.length > 0 &&
    !printer.paperSizes.includes(order.paperSize)
  ) {
    return false
  }
  return true
}

async function ensurePrinterRow(shopId: string, printer: SyncedPrinter) {
  const data = {
    model: printer.model || "Unknown",
    status: "ONLINE" as const,
    colorCapable: printer.capabilities?.color ?? true,
    duplexCapable: printer.capabilities?.duplex ?? true,
    paperSize: printer.capabilities?.paperSizes ?? ["A4"],
  }

  const existing = await prisma.printer.findFirst({
    where: { shopId, name: printer.name },
  })

  if (existing) {
    return prisma.printer.update({ where: { id: existing.id }, data })
  }

  return prisma.printer.create({
    data: { ...data, shopId, name: printer.name },
  })
}

async function pickPrinter(
  shopId: string,
  order: { color: string; sides: string; paperSize: string },
  pinnedName?: string | null,
) {
  const synced = await getSyncedPrinters(shopId)
  const onlineSynced = synced.filter(
    (p) => p.status === "ONLINE" || p.status === "IDLE",
  )

  const pinned = pinnedName
    ? onlineSynced.find(
        (p) =>
          p.name === pinnedName && capable(printerOptions([p])[0], order),
      )
    : undefined

  const candidates = pinned
    ? [pinned]
    : onlineSynced.filter((p) => capable(printerOptions([p])[0], order))

  const loads = await prisma.queueItem.groupBy({
    by: ["printerId"],
    where: { shopId, status: "PRINTING" },
    _count: { _all: true },
  })
  const loadFor = (printerId: string) =>
    loads.find((l) => l.printerId === printerId)?._count._all ?? 0

  let best: { printerName: string; printerId: string } | null = null
  let bestLoad = Number.MAX_SAFE_INTEGER

  for (const candidate of candidates) {
    const row = await ensurePrinterRow(shopId, candidate)
    const load = loadFor(row.id)
    if (load < bestLoad) {
      bestLoad = load
      best = { printerName: candidate.name, printerId: row.id }
    }
  }

  if (best) return best

  const rows = await prisma.printer.findMany({
    where: { shopId, status: "ONLINE" },
  })
  const fallback = rows.filter((row) =>
    capable(
      {
        color: row.colorCapable,
        duplex: row.duplexCapable,
        paperSizes: row.paperSize,
      },
      order,
    ),
  )

  const pinnedRow = pinnedName
    ? fallback.find((row) => row.name === pinnedName)
    : undefined
  const chosen = pinnedRow
    ? pinnedRow
    : fallback.sort((a, b) => loadFor(a.id) - loadFor(b.id))[0]

  return chosen ? { printerName: chosen.name, printerId: chosen.id } : null
}

async function notifyOwner(
  shopId: string,
  title: string,
  message: string,
  link?: string,
) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { ownerId: true },
  })
  if (!shop) return
  await prisma.notification.create({
    data: {
      userId: shop.ownerId,
      title,
      message,
      type: "ALERT",
      link,
      shopId,
    },
  })
}

async function notifyCustomer(
  userId: string,
  title: string,
  message: string,
  link: string,
  shopId: string,
) {
  await prisma.notification.create({
    data: { userId, title, message, type: "ORDER", link, shopId },
  })
}

export async function getAutomationOverview(shopId: string) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      autoWorkflowEnabled: true,
      autoWorkflowSkipQC: true,
      autoWorkflowPrinterName: true,
      autoWorkflowActivatedAt: true,
    },
  })
  if (!shop) return null

  const [subscription, server, synced] = await Promise.all([
    getAutomationSubscription(shopId),
    getActivePrintServerForShop(shopId),
    getSyncedPrinters(shopId),
  ])

  const printers = printerOptions(
    synced.filter((p) => p.status === "ONLINE" || p.status === "IDLE"),
  )

  return {
    premium: Boolean(subscription),
    planName: subscription?.plan.name ?? "Automation Premium",
    price: subscription?.plan.price ?? AUTOMATION_PRICE_INR,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    enabled: shop.autoWorkflowEnabled,
    skipQC: shop.autoWorkflowSkipQC,
    printerName: shop.autoWorkflowPrinterName,
    activatedAt: shop.autoWorkflowActivatedAt?.toISOString() ?? null,
    serverOnline: Boolean(server),
    printers,
  }
}

export async function activateAutomationAfterPayment(
  shopId: string,
  printerName?: string | null,
) {
  if (!(await isAutomationPremium(shopId))) return false

  const [server, synced] = await Promise.all([
    getActivePrintServerForShop(shopId),
    getSyncedPrinters(shopId),
  ])
  const online = synced.filter(
    (p) => p.status === "ONLINE" || p.status === "IDLE",
  )
  const validName =
    printerName && online.some((p) => p.name === printerName)
      ? printerName
      : null

  if (!server || online.length === 0) {
    await prisma.shop.update({
      where: { id: shopId },
      data: { autoWorkflowPrinterName: validName },
    })
    return false
  }

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      autoWorkflowEnabled: true,
      autoWorkflowPrinterName: validName,
      autoWorkflowActivatedAt: new Date(),
    },
  })

  await processAutomationBacklog(shopId).catch(() => {})
  return true
}

export async function dispatchAutomationOrder(shopId: string, orderId: string) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      autoWorkflowEnabled: true,
      autoWorkflowPrinterName: true,
    },
  })
  if (!shop?.autoWorkflowEnabled) return { skipped: "disabled" }
  if (!(await isAutomationPremium(shopId))) return { skipped: "premium" }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { files: true, queueItems: true },
  })
  if (!order || order.shopId !== shopId) return { skipped: "not-found" }
  if (order.paymentStatus !== "PAID") return { skipped: "unpaid" }
  if (order.status !== "IN_QUEUE") return { skipped: "not-queued" }
  if (order.files.length === 0) return { skipped: "no-files" }

  const queueItem = order.queueItems.find((q) => q.status === "QUEUED")
  if (!queueItem) return { skipped: "no-queue-item" }

  const server = await getActivePrintServerForShop(shopId)
  if (!server) {
    const changed = await prisma.queueItem.updateMany({
      where: { id: queueItem.id, lastError: null },
      data: { lastError: "Waiting for the print server to come online" },
    })
    if (changed.count > 0) {
      await notifyOwner(
        shopId,
        "Automation waiting",
        `Order ${order.orderId} is paid but the print server is offline. It will print automatically once the server reconnects.`,
        `/shop/orders/${order.id}`,
      )
    }
    return { skipped: "server-offline" }
  }

  const printer = await pickPrinter(
    shopId,
    order,
    shop.autoWorkflowPrinterName,
  )
  if (!printer) {
    const changed = await prisma.queueItem.updateMany({
      where: { id: queueItem.id, lastError: null },
      data: { lastError: "No online printer matches this order" },
    })
    if (changed.count > 0) {
      await notifyOwner(
        shopId,
        "Automation blocked",
        `Order ${order.orderId} is waiting: no online printer supports its paper size, colour or duplex settings.`,
        `/shop/orders/${order.id}`,
      )
    }
    return { skipped: "no-printer" }
  }

  const options = {
    copies: order.copies,
    sides: order.sides === "Double Sided" ? "two-sided-long-edge" : "one-sided",
    color: order.color === "Color",
    colorMode: order.color === "Color" ? "color" : "grayscale",
    paperSize: order.paperSize,
  }

  try {
    const claimed = await prisma.$transaction(async (tx) => {
      const claim = await tx.queueItem.updateMany({
        where: { id: queueItem.id, status: "QUEUED" },
        data: {
          status: "PRINTING",
          startedAt: new Date(),
          printerId: printer.printerId,
          assignedTo: "Automation",
          lastError: null,
        },
      })
      if (claim.count === 0) return false

      await tx.order.update({
        where: { id: order.id },
        data: { status: "PRINTING" },
      })
      await tx.printer.update({
        where: { id: printer.printerId },
        data: { status: "BUSY" },
      })
      await Promise.all(
        order.files.map((file) =>
          tx.printJob.create({
            data: {
              status: "PENDING",
              printerName: printer.printerName,
              fileUrl: file.url,
              fileName: file.name,
              options,
              shopId,
              printServerId: server.id,
              orderId: order.id,
              queueItemId: queueItem.id,
              printFileId: file.id,
            },
          }),
        ),
      )
      return true
    })

    if (!claimed) return { skipped: "already-claimed" }
  } catch (error) {
    await prisma.$transaction([
      prisma.queueItem.update({
        where: { id: queueItem.id },
        data: {
          status: "QUEUED",
          printerId: null,
          lastError:
            error instanceof Error ? error.message : "Failed to dispatch job",
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: "IN_QUEUE" },
      }),
      prisma.printer.update({
        where: { id: printer.printerId },
        data: { status: "ONLINE" },
      }),
    ])
    await notifyOwner(
      shopId,
      "Automation dispatch failed",
      `Order ${order.orderId} could not be sent to the printer. It is back in the queue.`,
      `/shop/orders/${order.id}`,
    )
    return { skipped: "error" }
  }

  if (order.userId) {
    await notifyCustomer(
      order.userId,
      "Printing Started",
      `Your order ${order.orderId} is printing automatically.`,
      `/customer/track?order=${order.orderId}`,
      shopId,
    )
  }

  return { dispatched: true, printerName: printer.printerName }
}

export async function processAutomationBacklog(shopId: string, limit = 5) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { autoWorkflowEnabled: true },
  })
  if (!shop?.autoWorkflowEnabled) return
  if (!(await isAutomationPremium(shopId))) return

  const items = await prisma.queueItem.findMany({
    where: {
      shopId,
      status: "QUEUED",
      order: { status: "IN_QUEUE", paymentStatus: "PAID" },
    },
    orderBy: [{ priority: "desc" }, { position: "asc" }],
    take: limit,
    select: { orderId: true },
  })

  for (const item of items) {
    try {
      await dispatchAutomationOrder(shopId, item.orderId)
    } catch {
    }
  }
}

export async function handleAutomationPrintJobUpdate(
  printJobId: string,
  status: string,
  error?: string,
) {
  const job = await prisma.printJob.findUnique({
    where: { id: printJobId },
    select: { shopId: true, queueItemId: true },
  })
  if (!job?.queueItemId) return

  const shop = await prisma.shop.findUnique({
    where: { id: job.shopId },
    select: { autoWorkflowEnabled: true, autoWorkflowSkipQC: true },
  })
  if (!shop?.autoWorkflowEnabled) return

  const queueItem = await prisma.queueItem.findUnique({
    where: { id: job.queueItemId },
    include: {
      order: {
        select: { id: true, orderId: true, userId: true },
      },
      printJobs: true,
    },
  })
  if (!queueItem) return

  if (status === "FAILED") {
    const attempts = queueItem.automationAttempts + 1
    await prisma.$transaction([
      prisma.queueItem.update({
        where: { id: queueItem.id },
        data: {
          status: "QUEUED",
          printerId: null,
          automationAttempts: attempts,
          lastError: error || "Printing failed",
        },
      }),
      prisma.order.update({
        where: { id: queueItem.order.id },
        data: { status: "PROCESSING" },
      }),
      ...(queueItem.printerId
        ? [
            prisma.printer.update({
              where: { id: queueItem.printerId },
              data: { status: "ONLINE" },
            }),
          ]
        : []),
    ])

    await notifyOwner(
      job.shopId,
      "Automation print failed",
      `Order ${queueItem.order.orderId} failed to print${
        attempts >= MAX_AUTOMATION_ATTEMPTS ? " multiple times" : ""
      }. It needs manual attention.`,
      `/shop/queue`,
    )
    return
  }

  if (status !== "COMPLETED") return

  const allJobs = await prisma.printJob.findMany({
    where: { queueItemId: queueItem.id },
    select: { status: true },
  })
  if (allJobs.length === 0 || allJobs.some((j) => j.status !== "COMPLETED")) {
    return
  }

  const ready = shop.autoWorkflowSkipQC
  await prisma.$transaction([
    prisma.queueItem.update({
      where: { id: queueItem.id },
      data: { status: "COMPLETED", completedAt: new Date(), lastError: null },
    }),
    prisma.order.update({
      where: { id: queueItem.order.id },
      data: {
        status: ready ? "READY" : "QUALITY_CHECK",
        completedAt: ready ? new Date() : null,
      },
    }),
    ...(queueItem.printerId
      ? [
          prisma.printer.update({
            where: { id: queueItem.printerId },
            data: { status: "ONLINE" },
          }),
        ]
      : []),
  ])

  if (queueItem.order.userId) {
    await notifyCustomer(
      queueItem.order.userId,
      ready ? "Order Ready" : "Quality Check",
      ready
        ? `Your order ${queueItem.order.orderId} is printed and ready for pickup!`
        : `Your order ${queueItem.order.orderId} has finished printing and is awaiting a quick quality check.`,
      `/customer/track?order=${queueItem.order.orderId}`,
      job.shopId,
    )
  }
}
