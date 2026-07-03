"use client"

import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { RefreshCw, Bell } from "lucide-react"

export default function MaintenancePage() {
  return (
    <>
      <PublicNavbar />
      <main className="flex items-center justify-center px-4 py-20 min-h-[80vh]">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🛠️</div>
          <h1 className="text-4xl font-bold">Under Maintenance</h1>
          <p className="mt-4 text-muted-foreground">
            We&apos;re performing scheduled maintenance. We expect to be back in about 30 minutes.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Estimated completion: 2:00 PM IST
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <div className="relative">
              <Input placeholder="Enter email for notification" className="pr-24" />
              <Button className="absolute right-1 top-1 gap-1" size="sm">
                <Bell className="h-3 w-3" /> Notify Me
              </Button>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
