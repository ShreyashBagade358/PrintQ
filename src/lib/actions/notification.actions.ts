"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getNotificationsAction(unreadOnly = false) {
  const session = await auth()
  if (!session?.user) return []

  const where: Record<string, unknown> = { userId: session.user.id }
  if (unreadOnly) where.read = false

  return prisma.notification.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function markNotificationReadAction(notificationId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })

  return { success: true }
}

export async function markAllNotificationsReadAction() {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })

  revalidatePath("/shop/notifications")
  revalidatePath("/customer/notifications")
  return { success: true }
}

export async function getUnreadNotificationCountAction() {
  const session = await auth()
  if (!session?.user) return 0
  return prisma.notification.count({
    where: { userId: session.user.id, read: false },
  })
}

export async function createNotificationAction(
  userId: string,
  title: string,
  message: string,
  type: "ORDER" | "PAYMENT" | "SYSTEM" | "ALERT",
  link?: string,
  shopId?: string,
) {
  await prisma.notification.create({
    data: { userId, title, message, type, link, shopId },
  })
}
