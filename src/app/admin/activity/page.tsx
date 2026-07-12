"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const logs = [
  { action: "Shop approved", user: "Admin", entity: "PrintPro Delhi", time: "2 min ago" },
  { action: "Subscription upgraded", user: "Rajesh K.", entity: "PrintPro Delhi", time: "15 min ago" },
  { action: "New shop registered", user: "Amit P.", entity: "Digital Prints", time: "1 hour ago" },
  { action: "Support ticket resolved", user: "Admin", entity: "TKT-001", time: "2 hours ago" },
  { action: "Payment received", user: "Stripe", entity: "PrintPro Delhi", time: "3 hours ago" },
  { action: "User suspended", user: "Admin", entity: "QuickPrint", time: "1 day ago" },
]

export default function AdminActivityPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Activity Logs" type="admin" />
      <div className="flex">
        <Sidebar type="admin" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-4 py-3 border-b last:border-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{log.user.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{log.user}</span>{" "}
                          {log.action}{" "}
                          <span className="font-medium">{log.entity}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
