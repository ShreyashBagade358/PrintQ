import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = requireApiAuth(req)
  if (error) return error

  const { id } = await params

  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!notification || notification.userId !== user!.id) return apiError("Notification not found", 404)

  await prisma.notification.update({ where: { id }, data: { read: true } })

  return NextResponse.json({ success: true })
}