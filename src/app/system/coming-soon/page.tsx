"use client"

import { useState } from "react"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Globe, MessageCircle } from "lucide-react"

export default function ComingSoonPage() {
  const [email, setEmail] = useState("")

  return (
    <>
      <PublicNavbar />
      <main className="flex items-center justify-center px-4 py-20 min-h-[80vh]">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🚀</div>
          <h1 className="text-2xl sm:text-4xl font-bold">Coming Soon</h1>
          <p className="mt-4 text-muted-foreground">
            We&apos;re working on something exciting. Stay tuned!
          </p>
          <div className="mt-8 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button className="gap-2 shrink-0">
                <Bell className="h-4 w-4" /> Notify
              </Button>
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="ghost" size="icon"><Globe className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><MessageCircle className="h-5 w-5" /></Button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
