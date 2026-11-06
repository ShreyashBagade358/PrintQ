import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

const addPrinterSchema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  paperSizes: z.array(z.string()).min(1),
  colorCapable: z.boolean(),
  duplexCapable: z.boolean(),
})

export async function GET(req: Request) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER", "STAFF"])
  if (error) return error

  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: user!.id }, { staff: { some: { userId: user!.id } } }] },
  })
  if (!shop) return apiError("No shop found", 404)

  const printers = await prisma.printer.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    printers: printers.map((p) => ({
      id: p.id,
      name: p.name,
      model: p.model,
      status: p.status,
      paperLevel: p.paperLevel,
      inkLevel: p.inkLevel,
      paperSizes: p.paperSize,
      colorCapable: p.colorCapable,
      duplexCapable: p.duplexCapable,
      createdAt: p.createdAt.toISOString(),
    })),
  })
}

export async function POST(req: Request) {
  const { user, error } = requireApiAuth(req, ["SHOP_OWNER"])
  if (error) return error

  const shop = await prisma.shop.findFirst({ where: { ownerId: user!.id } })
  if (!shop) return apiError("No shop found", 404)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError("Invalid JSON body")
  }

  const validated = addPrinterSchema.safeParse(body)
  if (!validated.success) return apiError(validated.error.errors[0].message, 400)

  const { paperSizes, ...printerData } = validated.data
  const printer = await prisma.printer.create({
    data: {
      ...printerData,
      paperSize: paperSizes,
      shopId: shop.id,
    },
  })

  return NextResponse.json({
    success: true,
    printer: { id: printer.id, name: printer.name, model: printer.model, status: printer.status },
  })
}