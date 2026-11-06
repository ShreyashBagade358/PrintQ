import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const { id } = await params

  let body: { printerId?: string }
  try {
    body = await req.json()
  } catch {
    return apiError("Invalid JSON body")
  }
  if (!body.printerId) return apiError("printerId is required")

  const queueItem = await prisma.queueItem.findUnique({ where: { id } })
  if (!queueItem) return apiError("Queue item not found", 404)

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
  })
  if (!shop || queueItem.shopId !== shop.id) return apiError("Unauthorized", 403)

  await prisma.queueItem.update({
    where: { id },
    data: { printerId: body.printerId },
  })

  return NextResponse.json({ success: true })
}