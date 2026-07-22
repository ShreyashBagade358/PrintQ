import { auth } from "@/lib/auth"

export default auth

export const config = {
  matcher: [
    "/customer/:path*",
    "/shop/:path*",
    "/scan/:path*",
  ],
}
