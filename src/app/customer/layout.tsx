"use client"

import { usePathname } from "next/navigation"
import { useState, useCallback } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"

const titleMap: Record<string, string> = {
  dashboard: "Dashboard",
  upload: "Upload",
  orders: "Orders",
  track: "Track Order",
  profile: "Profile",
  settings: "Settings",
  notifications: "Notifications",
  support: "Support",
  success: "Order Success",
  scan: "Scan",
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const segments = pathname.split("/")
  const last = segments[segments.length - 1] || "dashboard"

  let title = titleMap[last]
  if (!title) {
    const parent = segments[segments.length - 2]
    title = titleMap[parent] || last.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const handleMenuClick = useCallback(() => setMobileMenuOpen((v) => !v), [])
  const handleMobileClose = useCallback(() => setMobileMenuOpen(false), [])

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title={title} type="customer" onMenuClick={handleMenuClick} />
      <div className="flex">
        <Sidebar type="customer" mobileOpen={mobileMenuOpen} onMobileClose={handleMobileClose} />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
