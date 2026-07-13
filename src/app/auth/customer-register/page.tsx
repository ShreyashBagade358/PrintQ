"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { User, Eye, EyeOff, Loader2, ArrowLeft, FileText } from "lucide-react"
import { customerRegisterAction } from "@/lib/actions/auth.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CustomerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    const result = await customerRegisterAction(undefined, formData)
    setPending(false)
    if (result.success) {
      router.push(result.redirect || "/customer/dashboard")
    } else {
      toast.error(result.error || "Registration failed")
    }
  }

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
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg mb-4">
              <User className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Create Account</h1>
            <p className="mt-2 text-muted-foreground">Register to start placing print orders</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" name="name" placeholder="John Doe" required />
            <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
            <Input label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" />
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
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
            <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm your password" required />

            <div className="flex items-start gap-2">
              <Checkbox id="terms" className="mt-1" required />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the{" "}
                <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button className="w-full" size="lg" disabled={pending} type="submit">
              {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/customer-login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-600/10 via-teal-500/5 to-background items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="rounded-2xl bg-white/50 backdrop-blur-sm p-8 shadow-xl">
            <FileText className="mx-auto h-16 w-16 text-emerald-600" />
            <h3 className="mt-6 text-2xl font-bold">Start printing today.</h3>
            <p className="mt-2 text-muted-foreground">
              Upload files, place print jobs, and get real-time updates on your order status.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">File Upload</span>
              <span className="px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-700">Order Tracking</span>
              <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">Print Options</span>
              <span className="px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-700">Instant Quotes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
