import { createHmac, timingSafeEqual } from "crypto"

const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

function getSecret(): string {
  const secret = process.env.QR_SECRET || process.env.NEXTAUTH_SECRET
  if (secret) return secret
  // A temporary secret is acceptable ONLY in development. In production the app
  // must have QR_SECRET or NEXTAUTH_SECRET configured, otherwise QR tokens
  // cannot be generated or verified.
  if (process.env.NODE_ENV === "production") return ""
  console.warn("[QR] No QR_SECRET or NEXTAUTH_SECRET set — using temporary dev secret. Set NEXTAUTH_SECRET in production for stable tokens.")
  return "dev-qr-secret-only"
}

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url")
}

function fromB64url(input: string): string {
  return Buffer.from(input, "base64url").toString()
}

export function generateQrToken(shopId: string): string {
  const secret = getSecret()
  if (!secret) return ""
  const payload = `${shopId}:${Date.now()}`
  const signature = createHmac("sha256", secret).update(payload).digest("hex")
  return b64url(`${payload}:${signature}`)
}

export interface QrTokenVerification {
  shopId: string
  valid: boolean
  error?: string
  timestamp?: number
}

/**
 * Verifies a QR token's signature. By default tokens older than 24 hours are
 * rejected. Stored shop QR codes (which are meant to be printed and left at a
 * counter) should pass `{ ignoreExpiry: true }`; the "current QR" check against
 * `Shop.qrToken` then becomes the source of truth instead of the timestamp.
 */
export function verifyQrToken(
  token: string,
  opts?: { ignoreExpiry?: boolean }
): QrTokenVerification {
  try {
    const secret = getSecret()
    if (!secret) return { shopId: "", valid: false, error: "Server configuration error" }

    const decoded = fromB64url(token)
    const lastColon = decoded.lastIndexOf(":")
    if (lastColon === -1) return { shopId: "", valid: false, error: "Invalid token format" }

    const payload = decoded.slice(0, lastColon)
    const signature = decoded.slice(lastColon + 1)
    const expected = createHmac("sha256", secret).update(payload).digest("hex")

    if (signature.length !== expected.length) return { shopId: "", valid: false, error: "Invalid signature" }
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return { shopId: "", valid: false, error: "Invalid signature" }
    }

    const firstColon = payload.indexOf(":")
    if (firstColon === -1) return { shopId: "", valid: false, error: "Invalid payload" }

    const shopId = payload.slice(0, firstColon)
    const timestamp = parseInt(payload.slice(firstColon + 1), 10)

    if (isNaN(timestamp)) return { shopId: "", valid: false, error: "Invalid token" }
    if (!opts?.ignoreExpiry && Date.now() - timestamp > TOKEN_MAX_AGE_MS) {
      return { shopId: "", valid: false, error: "Token expired" }
    }

    return { shopId, valid: true, timestamp }
  } catch {
    return { shopId: "", valid: false, error: "Invalid token" }
  }
}