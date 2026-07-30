"use client"

import { usePathname } from "next/navigation"
import { useState, useCallback } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"

const titleMap: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "Orders",
  queue: "Queue",
  printers: "Printers",
  customers: "Customers",
  pricing: "Pricing",
  analytics: "Analytics",
  reports: "Reports",
  staff: "Staff",
  billing: "Billing",
  subscription: "Subscription",
  settings: "Settings",
  notifications: "Notifications",
  profile: "Profile",
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
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
      <DashboardNavbar title={title} type="shop" onMenuClick={handleMenuClick} />
      <div className="flex">
        <Sidebar type="shop" mobileOpen={mobileMenuOpen} onMobileClose={handleMobileClose} />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
