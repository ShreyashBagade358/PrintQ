import { createHmac, timingSafeEqual } from "crypto"

const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

function getSecret(): string {
  const secret = process.env.QR_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) return ""
  return secret
}

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url")
}

function fromB64url(input: string): string {
  return Buffer.from(input, "base64url").toString()
}

export function generateShortCode(shopId: string): string {
  const secret = getSecret()
  if (!secret) return "000000"
  const hash = createHmac("sha256", secret).update(`short:${shopId}`).digest()
  let num = 0n
  for (let i = 0; i < 4; i++) num = (num << 8n) + BigInt(hash[i])
  return num.toString(36).padStart(6, "0").slice(0, 6).toUpperCase()
}

export function generateQrToken(shopId: string): string {
  const secret = getSecret()
  if (!secret) return ""
  const payload = `${shopId}:${Date.now()}`
  const signature = createHmac("sha256", secret).update(payload).digest("hex")
  return b64url(`${payload}:${signature}`)
}

export function verifyQrToken(token: string): { shopId: string; valid: boolean; error?: string } {
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
    if (Date.now() - timestamp > TOKEN_MAX_AGE_MS) {
      return { shopId: "", valid: false, error: "Token expired" }
    }

    return { shopId, valid: true }
  } catch {
    return { shopId: "", valid: false, error: "Invalid token" }
  }
}
