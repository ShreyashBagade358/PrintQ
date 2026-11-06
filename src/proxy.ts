import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      const res = new NextResponse(null, { status: 204 })
      Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
      return res
    }
    const response = NextResponse.next()
    if (request.headers.get("origin")) {
      Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v))
    }
    return response
  }

  return auth(request)
}

export const config = {
  matcher: ["/api/:path*", "/customer/:path*", "/shop/:path*"],
}