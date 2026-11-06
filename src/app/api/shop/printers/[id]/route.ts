import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

const VALID_STATUSES = ["ONLINE", "OFFLINE", "BUSY", "ERROR"]

async function authorizeShop(userId: string, shopId: string) {
  return prisma.shop.findFirst({
    where: { id: shopId, OR: [{ ownerId: userId }, { staff: { some: { userId } } }] },
    select: { id: true },
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const { id } = await params

  let body: { status?: string }
  try {
    body = await req.json()
  } catch {
    return apiError("Invalid JSON body")
  }

  const printer = await prisma.printer.findUnique({ where: { id } })
  if (!printer) return apiError("Printer not found", 404)

  const shop = await authorizeShop(user!.id, printer.shopId)
  if (!shop) return apiError("Printer not found", 404)

  if (body.status) {
    const status = body.status.toUpperCase()
    if (!VALID_STATUSES.includes(status)) {
      return apiError("status must be one of ONLINE, OFFLINE, BUSY, ERROR")
    }
    await prisma.printer.update({ where: { id }, data: { status: status as never } })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const { id } = await params

  const printer = await prisma.printer.findUnique({ where: { id } })
  if (!printer) return apiError("Printer not found", 404)

  const shop = await authorizeShop(user!.id, printer.shopId)
  if (!shop) return apiError("Printer not found", 404)

  await prisma.printer.delete({ where: { id } })

  return NextResponse.json({ success: true })
}