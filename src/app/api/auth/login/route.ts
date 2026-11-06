import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signAuthToken } from "@/lib/auth-token"
import { apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return apiError("Invalid JSON body")
  }

  const email = (body.email || "").trim().toLowerCase()
  const password = body.password || ""
  if (!email || !password) return apiError("Email and password are required")

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) return apiError("Invalid email or password", 401)
  if (!user.emailVerified) return apiError("Please verify your email before logging in", 403)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return apiError("Invalid email or password", 401)

  const token = signAuthToken({ id: user.id, name: user.name, email: user.email, role: user.role })

  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, image: user.image },
  })
}