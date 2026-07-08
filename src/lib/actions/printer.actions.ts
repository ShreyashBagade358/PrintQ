"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createNotificationAction } from "./notification.actions"

const addPrinterSchema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  paperSizes: z.array(z.string()).min(1),
  colorCapable: z.boolean(),
  duplexCapable: z.boolean(),
})

export async function getPrintersAction() {
  const session = await auth()
  if (!session?.user) return []

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: session.user.id }, { staff: { some: { userId: session.user.id } } }] },
  })
  if (!shop) return []

  return prisma.printer.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function addPrinterAction(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({ where: { ownerId: session.user.id } })
  if (!shop) return { error: "No shop found" }

  const raw: Record<string, unknown> = {
    colorCapable: false,
    duplexCapable: false,
  }
  for (const [key, value] of formData.entries()) {
    if (key === "paperSizes") {
      raw[key] = JSON.parse(value as string)
    } else if (key === "colorCapable" || key === "duplexCapable") {
      raw[key] = value === "true"
    } else {
      raw[key] = value
    }
  }

  const validated = addPrinterSchema.safeParse(raw)
  if (!validated.success) return { error: validated.error.errors[0].message }

  const { paperSizes, ...printerData } = validated.data
  await prisma.printer.create({
    data: {
      ...printerData,
      paperSize: paperSizes,
      shopId: shop.id,
    },
  })

  revalidatePath("/shop/printers")
  return { success: true }
}

export async function updatePrinterStatusAction(printerId: string, status: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const printer = await prisma.printer.findUnique({ where: { id: printerId } })
  if (!printer) return { error: "Printer not found" }

  const shop = await prisma.shop.findFirst({ where: { ownerId: session.user.id } })
  if (!shop || printer.shopId !== shop.id) return { error: "Unauthorized" }

  await prisma.printer.update({
    where: { id: printerId },
    data: { status: status as never },
  })

  revalidatePath("/shop/printers")
  revalidatePath("/shop/queue")
  return { success: true }
}

export async function updatePrinterLevelsAction(
  printerId: string,
  paperLevel: number,
  inkLevel: number,
) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const printer = await prisma.printer.findUnique({ where: { id: printerId } })
  if (!printer) return { error: "Printer not found" }

  const shop = await prisma.shop.findFirst({ where: { ownerId: session.user.id } })
  if (!shop || printer.shopId !== shop.id) return { error: "Unauthorized" }

  await prisma.printer.update({
    where: { id: printerId },
    data: { paperLevel, inkLevel },
  })

  revalidatePath("/shop/printers")
  return { success: true }
}

export async function removePrinterAction(printerId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const shop = await prisma.shop.findFirst({ where: { ownerId: session.user.id } })
  if (!shop) return { error: "No shop found" }

  await prisma.printer.deleteMany({ where: { id: printerId, shopId: shop.id } })

  revalidatePath("/shop/printers")
  return { success: true }
}
