"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Printer, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
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
          <h1 className="text-3xl font-bold">Forgot password?</h1>
          <p className="mt-2 text-muted-foreground">
            No worries. Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form className="space-y-5">
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Button className="w-full" size="lg">
            Send Reset Link
          </Button>
        </form>

        <div className="text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
