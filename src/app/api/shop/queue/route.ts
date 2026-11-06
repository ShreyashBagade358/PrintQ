import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
  })
  if (!shop) return apiError("No shop found", 404)

  const items = await prisma.queueItem.findMany({
    where: { shopId: shop.id, status: { in: ["QUEUED", "PRINTING"] } },
    include: { order: { include: { customer: true, files: true } }, printer: true },
    orderBy: [{ priority: "desc" }, { position: "asc" }],
  })

  return NextResponse.json({
    queue: items.map((q) => ({
      id: q.id,
      status: q.status,
      position: q.position,
      priority: q.priority,
      assignedTo: q.assignedTo,
      createdAt: q.createdAt.toISOString(),
      startedAt: q.startedAt?.toISOString() || null,
      printer: q.printer ? { id: q.printer.id, name: q.printer.name, status: q.printer.status } : null,
      order: q.order
        ? {
            id: q.order.id,
            orderId: q.order.orderId,
            status: q.order.status,
            pages: q.order.pages,
            copies: q.order.copies,
            color: q.order.color,
            paperSize: q.order.paperSize,
            sides: q.order.sides,
            total: q.order.total,
            notes: q.order.notes,
            createdAt: q.order.createdAt.toISOString(),
            customer: q.order.customer ? { name: q.order.customer.name, email: q.order.customer.email } : null,
            files: q.order.files.map((f) => ({ id: f.id, name: f.name, url: f.url, pages: f.pages })),
          }
        : null,
    })),
  })
}