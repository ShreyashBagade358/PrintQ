import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { signAuthToken } from "@/lib/auth-token"
import { apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

const registerSchema = z.object({
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  shopSlug: z.string().min(2, "Shop slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  pinCode: z.string().min(4, "Pin code must be at least 4 characters"),
  shopPhone: z.string().min(10, "Phone must be at least 10 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError("Invalid JSON body")
  }

  const validated = registerSchema.safeParse(body)
  if (!validated.success) return apiError(validated.error.errors[0].message, 400)

  const { shopName, shopSlug, address, city, state, pinCode, shopPhone, name, email, phone, password } = validated.data
  const normalizedEmail = email.toLowerCase()

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existingUser) return apiError("Email already registered", 409)

  const existingShop = await prisma.shop.findUnique({ where: { slug: shopSlug } })
  if (existingShop) return apiError("Shop slug already taken", 409)

  const hashedPassword = await bcrypt.hash(password, 12)

  let userId = ""
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          phone,
          password: hashedPassword,
          role: "SHOP_OWNER",
          emailVerified: new Date(),
        },
      })
      userId = user.id
      await tx.shop.create({
        data: {
          name: shopName,
          slug: shopSlug,
          address,
          city,
          state,
          pinCode,
          phone: shopPhone,
          email: normalizedEmail,
          ownerId: user.id,
          status: "ACTIVE",
        },
      })
    })
  } catch {
    return apiError("Registration failed. Please try again.", 500)
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return apiError("Registration failed. Please try again.", 500)

  const token = signAuthToken({ id: user.id, name: user.name, email: user.email, role: user.role })

  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
  })
}