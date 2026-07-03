import { createHmac, timingSafeEqual } from "crypto"

const SECRET = process.env.NEXTAUTH_SECRET || process.env.QR_SECRET || "printq-qr-fallback-secret"

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url")
}

function fromB64url(input: string): string {
  return Buffer.from(input, "base64url").toString()
}

export function generateShortCode(shopId: string): string {
  const hash = createHmac("sha256", SECRET).update(`short:${shopId}`).digest()
  let num = 0n
  for (let i = 0; i < 4; i++) num = (num << 8n) + BigInt(hash[i])
  return num.toString(36).padStart(6, "0").slice(0, 6).toUpperCase()
}

export function generateQrToken(shopId: string): string {
  const payload = `${shopId}:${Date.now()}`
  const signature = createHmac("sha256", SECRET).update(payload).digest("hex")
  return b64url(`${payload}:${signature}`)
}

export function verifyQrToken(token: string): { shopId: string; valid: boolean; error?: string } {
  try {
    const decoded = fromB64url(token)
    const lastColon = decoded.lastIndexOf(":")
    if (lastColon === -1) return { shopId: "", valid: false, error: "Invalid token format" }

    const payload = decoded.slice(0, lastColon)
    const signature = decoded.slice(lastColon + 1)
    const expected = createHmac("sha256", SECRET).update(payload).digest("hex")

    if (signature.length !== expected.length) return { shopId: "", valid: false, error: "Invalid signature" }
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return { shopId: "", valid: false, error: "Invalid signature" }
    }

    const firstColon = payload.indexOf(":")
    if (firstColon === -1) return { shopId: "", valid: false, error: "Invalid payload" }

    return { shopId: payload.slice(0, firstColon), valid: true }
  } catch {
    return { shopId: "", valid: false, error: "Invalid token" }
  }
}
