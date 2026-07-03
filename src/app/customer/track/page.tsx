"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Phone, Share2, CheckCircle, Clock, Printer, Package, Check } from "lucide-react"

const timelineSteps = [
  { icon: CheckCircle, label: "Received", time: "10:30 AM", completed: true },
  { icon: Clock, label: "Processing", time: "10:45 AM", completed: true },
  { icon: Printer, label: "Printing", time: "In Progress", completed: false, active: true },
  { icon: Package, label: "Ready", time: "Estimated 3:00 PM", completed: false },
  { icon: Check, label: "Completed", time: "Pending", completed: false },
]

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Track Order" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
          <div className="mx-auto max-w-2xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Enter Order ID to track..." className="pl-9 h-12 text-base" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold">ORD-A1B2C3</h2>
                      <p className="text-sm text-muted-foreground">10 pages, Black &amp; White, A4</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      Printing
                    </span>
                  </div>

                  <div className="space-y-0">
                    {timelineSteps.map((step, index) => {
                      const Icon = step.icon
                      const isLast = index === timelineSteps.length - 1
                      return (
                        <div key={step.label} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              step.completed
                                ? "bg-emerald-100 text-emerald-600"
                                : step.active
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            {!isLast && (
                              <div className={`w-0.5 h-12 ${
                                step.completed ? "bg-emerald-200" : "bg-muted"
                              }`} />
                            )}
                          </div>
                          <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
                            <p className={`font-medium ${
                              step.completed || step.active ? "text-foreground" : "text-muted-foreground"
                            }`}>{step.label}</p>
                            <p className="text-sm text-muted-foreground">{step.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Phone className="h-4 w-4" /> Call Shop
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Share2 className="h-4 w-4" /> Share Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
