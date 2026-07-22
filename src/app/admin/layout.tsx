"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"

const titleMap: Record<string, string> = {
  dashboard: "Admin Dashboard",
  shops: "Shops",
  users: "Users",
  subscriptions: "Subscriptions",
  payments: "Payments",
  coupons: "Coupons",
  tickets: "Tickets",
  blog: "Blog",
  cms: "CMS",
  activity: "Activity",
  settings: "Settings",
  help: "Help",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const segments = pathname.split("/")
  const last = segments[segments.length - 1] || "dashboard"

  let title = titleMap[last]
  if (!title) {
    const parent = segments[segments.length - 2]
    title = titleMap[parent] || last.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title={title} type="admin" />
      <div className="flex">
        <Sidebar type="admin" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
