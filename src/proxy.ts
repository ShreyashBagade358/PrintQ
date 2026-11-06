import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
}

function applyCors(response: NextResponse) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => response.headers.set(key, value))
}

export default auth((request) => {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith("/api")) return

  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 })
    applyCors(response)
    return response
  }

  const response = NextResponse.next()
  if (request.headers.get("origin")) applyCors(response)
  return response
})

export const config = {
  matcher: ["/api/:path*", "/customer/:path*", "/shop/:path*"],
}