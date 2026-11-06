import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const { id } = await params

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
    select: { id: true },
  })
  if (!shop) return apiError("No shop found", 404)

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      files: true,
      queueItems: { include: { printer: true }, orderBy: { createdAt: "asc" } },
    },
  })

  if (!order || order.shopId !== shop.id) return apiError("Order not found", 404)

  return NextResponse.json({
    id: order.id,
    orderId: order.orderId,
    status: order.status,
    priority: order.priority,
    pages: order.pages,
    copies: order.copies,
    color: order.color,
    paperSize: order.paperSize,
    sides: order.sides,
    finishing: order.finishing,
    amount: order.amount,
    discount: order.discount,
    total: order.total,
    notes: order.notes,
    printNotes: order.printNotes,
    printSettings: order.printSettings,
    estimatedReadyAt: order.estimatedReadyAt?.toISOString() || null,
    createdAt: order.createdAt.toISOString(),
    completedAt: order.completedAt?.toISOString() || null,
    customer: order.customer
      ? { id: order.customer.id, name: order.customer.name, email: order.customer.email, phone: order.customer.phone, totalOrders: order.customer.totalOrders, totalSpent: order.customer.totalSpent }
      : null,
    files: order.files.map((f) => ({ id: f.id, name: f.name, url: f.url, size: f.size, type: f.type, pages: f.pages })),
    queueItems: order.queueItems.map((q) => ({
      id: q.id,
      status: q.status,
      position: q.position,
      priority: q.priority,
      assignedTo: q.assignedTo,
      createdAt: q.createdAt.toISOString(),
      startedAt: q.startedAt?.toISOString() || null,
      completedAt: q.completedAt?.toISOString() || null,
      printer: q.printer ? { id: q.printer.id, name: q.printer.name, status: q.printer.status } : null,
    })),
  })
}