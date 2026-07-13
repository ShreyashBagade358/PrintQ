"use client"

import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"

export function ScanLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Scan Shop QR" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
