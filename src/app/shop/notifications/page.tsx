"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

const notifications = [
  { id: 1, title: "New Order Received", message: "Order ORD-A1B2C3 from Rahul S. has been placed.", type: "order", time: "2 min ago", read: false },
  { id: 2, title: "Payment Received", message: "Payment of ₹100.00 for ORD-D4E5F6 completed.", type: "payment", time: "15 min ago", read: false },
  { id: 3, title: "Low Paper Alert", message: "HP LaserJet is running low on paper (20% remaining).", type: "alert", time: "1 hour ago", read: true },
  { id: 4, title: "Order Ready for Pickup", message: "ORD-G7H8I9 is ready for customer collection.", type: "order", time: "2 hours ago", read: true },
  { id: 5, title: "System Update", message: "PrintQ v2.5.0 will be deployed tonight at 2 AM.", type: "system", time: "1 day ago", read: true },
]

export default function ShopNotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Notifications" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Notifications</h2>
              <Button variant="outline" size="sm" className="gap-2">
                <CheckCheck className="h-4 w-4" /> Mark All Read
              </Button>
            </div>

            <Card>
              <CardContent className="p-0 divide-y">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 ${
                      !notif.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      notif.type === "order" ? "bg-blue-100 text-blue-600"
                        : notif.type === "payment" ? "bg-emerald-100 text-emerald-600"
                        : notif.type === "alert" ? "bg-amber-100 text-amber-600"
                        : "bg-purple-100 text-purple-600"
                    }`}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{notif.title}</p>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                        </div>
                        {!notif.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
