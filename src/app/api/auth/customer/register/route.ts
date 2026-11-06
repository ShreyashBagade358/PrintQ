import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { signAuthToken } from "@/lib/auth-token"
import { apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

const customerRegisterSchema = z.object({
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

  const validated = customerRegisterSchema.safeParse(body)
  if (!validated.success) return apiError(validated.error.errors[0].message, 400)

  const { name, email, phone, password } = validated.data
  const normalizedEmail = email.toLowerCase()

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existingUser) return apiError("Email already registered", 409)

  const hashedPassword = await bcrypt.hash(password, 12)

  let userId = ""
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        role: "CUSTOMER",
        emailVerified: new Date(),
      },
    })
    userId = user.id
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