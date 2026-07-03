"use client"

import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function OfflinePage() {
  return (
    <>
      <PublicNavbar />
      <main className="flex items-center justify-center px-4 py-20 min-h-[80vh]">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">📡</div>
          <h1 className="text-4xl font-bold">You&apos;re Offline</h1>
          <p className="mt-4 text-muted-foreground">
            Please check your internet connection and try again.
          </p>
          <Button className="mt-8 gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" /> Retry Connection
          </Button>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
