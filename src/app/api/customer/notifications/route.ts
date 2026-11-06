import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiAuth } from "@/lib/api-auth"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { user, error } = requireApiAuth(req)
  if (error) return error

  const url = new URL(req.url)
  const unreadOnly = url.searchParams.get("unreadOnly") === "true"

  const where = { userId: user!.id, ...(unreadOnly ? { read: false } : {}) }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where: { userId: user!.id, read: false } }),
  ])

  return NextResponse.json({
    unreadCount,
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
  })
}

export async function POST(req: Request) {
  const { user, error } = requireApiAuth(req)
  if (error) return error

  await prisma.notification.updateMany({
    where: { userId: user!.id, read: false },
    data: { read: true },
  })

  return NextResponse.json({ success: true })
}