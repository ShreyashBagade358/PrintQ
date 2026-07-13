"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function SystemErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-red-50/50 to-background p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">500</h1>
        <h2 className="text-xl font-semibold mb-2">Server Error</h2>
        <p className="text-muted-foreground mb-8">
          Something went wrong on our end. Our team has been notified and is working on a fix.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Link href="/public/landing">
            <Button className="gap-2">
              <Home className="h-4 w-4" /> Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
