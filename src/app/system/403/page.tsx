"use client"

import { Button } from "@/components/ui/button"
import { ShieldX, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-orange-50/50 to-background p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 mb-6">
          <ShieldX className="h-10 w-10 text-orange-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">403</h1>
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-8">
          You don&apos;t have permission to access this page. Please contact your administrator.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => window.history.back()} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Link href="/auth/login">
            <Button className="gap-2">Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
