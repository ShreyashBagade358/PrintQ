"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Printer, User, ArrowRight, Store } from "lucide-react"
import { Button } from "@/components/ui/button"

const roles = [
  {
    id: "shop",
    title: "I Run a Print Shop",
    description: "Manage orders, track queue, handle printers, and grow your business.",
    href: "/auth/shop-login",
    icon: Store,
    gradient: "from-blue-600 to-indigo-600",
    lightGradient: "from-blue-50 to-indigo-50",
    borderHover: "hover:border-blue-200",
  },
  {
    id: "customer",
    title: "I'm a Customer",
    description: "Upload files, place print orders, and track progress in real time.",
    href: "/auth/customer-login",
    icon: User,
    gradient: "from-emerald-600 to-teal-600",
    lightGradient: "from-emerald-50 to-teal-50",
    borderHover: "hover:border-emerald-200",
  },
]

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-10">
          <Link href="/public/landing" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Printer className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">PrintQ</span>
          </Link>
          <h1 className="text-3xl font-bold">Welcome to PrintQ</h1>
          <p className="mt-2 text-muted-foreground text-lg">Choose how you want to sign in</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <Link key={role.id} href={role.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all ${role.borderHover} hover:shadow-lg hover:shadow-black/5 cursor-pointer`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${role.lightGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient} shadow-lg mb-5`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">{role.title}</h2>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                      {role.description}
                    </p>
                    <div className={`inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${role.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                      Sign In <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
