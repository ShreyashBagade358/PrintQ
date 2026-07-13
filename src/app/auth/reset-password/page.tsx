"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Printer, Eye, EyeOff, Check, X } from "lucide-react"

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const password = ""

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <Link href="/public/landing" className="inline-flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Printer className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">PrintQ</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Reset password</h1>
          <p className="mt-2 text-muted-foreground">
            Choose a new password for your account.
          </p>
        </div>

        <form className="space-y-5">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Password requirements:</p>
            {requirements.map((req) => (
              <div key={req.label} className="flex items-center gap-2 text-xs">
                {req.met ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={req.met ? "text-emerald-600" : "text-muted-foreground"}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>

          <Button className="w-full" size="lg">
            Reset Password
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
