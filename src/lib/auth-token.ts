import { createHmac, timingSafeEqual } from "crypto"

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set — required for API token auth")
  return secret
}

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export interface AuthTokenPayload {
  id: string
  name: string
  email: string
  role: string
  exp: number
}

export function signAuthToken(
  payload: { id: string; name: string; email: string; role: string },
  ttlSeconds = DEFAULT_TTL_SECONDS
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url")
  const sig = createHmac("sha256", getSecret()).update(body).digest("base64url")
  return `${body}.${sig}`
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const [body, sig] = token.split(".")
    if (!body || !sig) return null

    const expected = createHmac("sha256", getSecret()).update(body).digest("base64url")
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null

    const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as AuthTokenPayload
    if (!parsed.id || !parsed.role || typeof parsed.exp !== "number" || parsed.exp * 1000 < Date.now()) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}