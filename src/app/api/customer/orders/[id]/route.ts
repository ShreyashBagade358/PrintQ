import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = requireApiAuth(req)
  if (error) return error

  const { id } = await params

  const customer =
    (await prisma.customer.findFirst({ where: { userId: user!.id } })) ||
    (user!.email ? await prisma.customer.findFirst({ where: { email: user!.email } }) : null)

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      files: true,
      shop: { select: { id: true, name: true, address: true, phone: true, email: true, logo: true } },
      queueItems: { include: { printer: true }, orderBy: { createdAt: "asc" } },
    },
  })

  if (!order) return apiError("Order not found", 404)
  if (customer && order.customerId !== customer.id) return apiError("Order not found", 404)

  return NextResponse.json({
    id: order.id,
    orderId: order.orderId,
    status: order.status,
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
    shop: order.shop
      ? { id: order.shop.id, name: order.shop.name, address: order.shop.address, phone: order.shop.phone, email: order.shop.email, logo: order.shop.logo }
      : null,
    files: order.files.map((f) => ({ id: f.id, name: f.name, url: f.url, size: f.size, type: f.type, pages: f.pages })),
    queue: order.queueItems.map((q) => ({
      id: q.id,
      status: q.status,
      position: q.position,
      priority: q.priority,
      createdAt: q.createdAt.toISOString(),
      startedAt: q.startedAt?.toISOString() || null,
      completedAt: q.completedAt?.toISOString() || null,
      printer: q.printer ? { id: q.printer.id, name: q.printer.name, model: q.printer.model } : null,
    })),
  })
}