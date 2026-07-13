"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, ArrowRight, RefreshCw } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center space-y-8"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-10 w-10 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Check your email</h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-foreground">owner@example.com</span>
          </p>
        </div>

        <div className="rounded-xl border bg-muted/30 p-6">
          <Button variant="outline" className="w-full gap-2" asChild>
            <Link href="https://gmail.com" target="_blank">
              <Mail className="h-4 w-4" />
              Open Gmail
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Resend Email
          </Button>
          <Link href="/auth/register">
            <Button variant="ghost" className="w-full">
              Change Email
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
