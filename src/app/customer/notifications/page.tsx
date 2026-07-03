"use client"

import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck } from "lucide-react"

const notifications = [
  { title: "Order Ready", message: "Your order ORD-A1B2C3 is ready for pickup!", time: "10 min ago", read: false, type: "order" },
  { title: "Order Received", message: "Your order ORD-D4E5F6 has been received by the shop.", time: "2 hours ago", read: false, type: "order" },
  { title: "Payment Confirmed", message: "Payment of ₹100.00 for ORD-D4E5F6 was successful.", time: "1 day ago", read: true, type: "payment" },
]

export default function CustomerNotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Notifications" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Notifications</h2>
            <Button variant="outline" size="sm" className="gap-2"><CheckCheck className="h-4 w-4" /> Mark All Read</Button>
          </div>
          <Card>
            <CardContent className="p-0 divide-y">
              {notifications.map((n, i) => (
                <div key={i} className={`flex items-start gap-4 p-4 ${!n.read ? "bg-primary/5" : ""}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    n.type === "order" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                  }`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-sm text-muted-foreground">{n.message}</p>
                      </div>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
