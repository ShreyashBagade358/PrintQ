"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Store, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import { loginAction } from "@/lib/actions/auth.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ShopLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const [state, formAction, pending] = useActionState(loginAction, undefined)

  useEffect(() => {
    if (state?.success) {
      router.push(state.redirect || "/shop/dashboard")
    }
  }, [state?.success, state?.redirect, router])

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state?.error])

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4" /> Back to selection
            </Link>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mb-4">
              <Store className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Shop Login</h1>
            <p className="mt-2 text-muted-foreground">Sign in to manage your print shop</p>
          </div>

          <form action={formAction} className="space-y-5">
            <Input label="Email" name="email" type="email" placeholder="shop@example.com" required />
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <label htmlFor="remember" className="text-sm font-medium cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button className="w-full" size="lg" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In to Shop
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have a shop?{" "}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              Register your shop
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600/10 via-indigo-500/5 to-background items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="rounded-2xl bg-white/50 backdrop-blur-sm p-8 shadow-xl">
            <Store className="mx-auto h-16 w-16 text-blue-600" />
            <h3 className="mt-6 text-2xl font-bold">Manage your shop.</h3>
            <p className="mt-2 text-muted-foreground">
              Track orders, manage print queue, handle printers, and grow your business — all from one place.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">Order Management</span>
              <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">Queue System</span>
              <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">Printer Control</span>
              <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
