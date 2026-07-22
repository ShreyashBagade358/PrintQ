import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as {
          email: string
          password: string
        }

        const { prisma } = await import("@/lib/prisma")
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.password) return null
        if (!user.emailVerified) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role as string | undefined
      const pathname = nextUrl.pathname

      const shopRoutes = pathname.startsWith("/shop")
      const customerRoutes = pathname.startsWith("/customer")
      const authRoutes = pathname.startsWith("/auth")

      if (authRoutes && isLoggedIn) {
        const home = role === "SHOP_OWNER" || role === "STAFF" ? "/shop/dashboard"
          : role === "CUSTOMER" ? "/customer/dashboard"
          : "/"
        return Response.redirect(new URL(home, nextUrl))
      }

      if (shopRoutes && (!isLoggedIn || (role !== "SHOP_OWNER" && role !== "STAFF"))) {
        if (!isLoggedIn) return Response.redirect(new URL("/auth/shop-login", nextUrl))
        return Response.redirect(new URL("/customer/dashboard", nextUrl))
      }

      if (customerRoutes && (!isLoggedIn || role !== "CUSTOMER")) {
        if (!isLoggedIn) return Response.redirect(new URL("/auth/customer-login", nextUrl))
        return Response.redirect(new URL("/shop/dashboard", nextUrl))
      }

      if (pathname.startsWith("/scan") && !isLoggedIn) {
        return Response.redirect(new URL("/auth/customer-login?callbackUrl=" + encodeURIComponent(pathname), nextUrl))
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = (user as Record<string, unknown>).role as string
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  trustHost: true,
}
