"use client"

import { Button } from "@/components/ui/button"
import { Wrench, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function ServiceUnavailablePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-yellow-50/50 to-background p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-yellow-100 mb-6">
          <Wrench className="h-10 w-10 text-yellow-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">503</h1>
        <h2 className="text-xl font-semibold mb-2">Under Maintenance</h2>
        <p className="text-muted-foreground mb-8">
          We&apos;re performing scheduled maintenance. We&apos;ll be back shortly.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
          <Link href="/public/landing">
            <Button className="gap-2">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
