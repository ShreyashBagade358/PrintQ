import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

const VALID_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"]

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const { id } = await params

  let body: { priority?: string }
  try {
    body = await req.json()
  } catch {
    return apiError("Invalid JSON body")
  }
  const priority = body.priority?.toUpperCase()
  if (!priority || !VALID_PRIORITIES.includes(priority)) return apiError("priority must be one of LOW, NORMAL, HIGH, URGENT")

  const queueItem = await prisma.queueItem.findUnique({ where: { id } })
  if (!queueItem) return apiError("Queue item not found", 404)

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
  })
  if (!shop || queueItem.shopId !== shop.id) return apiError("Unauthorized", 403)

  await prisma.$transaction([
    prisma.queueItem.update({
      where: { id },
      data: { priority: priority as never },
    }),
    prisma.order.update({
      where: { id: queueItem.orderId },
      data: { priority: priority as never },
    }),
  ])

  return NextResponse.json({ success: true })
}