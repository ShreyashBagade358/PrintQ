import { NextResponse } from "next/server"
import { verifyAuthToken, type AuthTokenPayload } from "@/lib/auth-token"

type AuthRequest = Pick<Request, "headers">

export function getApiAuth(req: AuthRequest): AuthTokenPayload | null {
  const header = req.headers.get("authorization") || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) return null
  return verifyAuthToken(token)
}

export function requireApiAuth(
  req: AuthRequest,
  roles?: string[]
): { user: AuthTokenPayload | null; error: NextResponse | null } {
  const user = getApiAuth(req)
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { user, error: null }
}

export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export function apiOk(data: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init)
}