"use client"

import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { ScanForm } from "./scan-form"

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Scan Shop QR" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64">
          <div className="max-w-md mx-auto space-y-8 pt-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold">Scan Shop QR</h1>
              <p className="mt-2 text-muted-foreground">
                Enter the QR code link or scan code to connect with a print shop
              </p>
            </div>
            <ScanForm />
          </div>
        </main>
      </div>
    </div>
  )
}
