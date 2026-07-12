"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, ShoppingCart, FileText, TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  { icon: IndianRupee, label: "Revenue", value: "₹1,24,500", change: "+12.5%", trend: "up" },
  { icon: ShoppingCart, label: "Orders", value: "156", change: "+8.2%", trend: "up" },
  { icon: FileText, label: "Pages Printed", value: "12,450", change: "+15.3%", trend: "up" },
  { icon: IndianRupee, label: "Avg. Order Value", value: "₹798", change: "+3.4%", trend: "up" },
]

const monthlyRevenue = [45000, 52000, 48000, 58000, 55000, 62000, 68000, 72000, 65000, 78000, 85000, 95000]
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function ShopAnalyticsPage() {
  const maxRevenue = Math.max(...monthlyRevenue)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Analytics" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                        }`}>
                          {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {stat.change}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-end justify-between gap-2">
                    {monthlyRevenue.map((rev, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className="w-full bg-primary/60 rounded-t-md hover:bg-primary/80 transition-all"
                          style={{ height: `${(rev / maxRevenue) * 100}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">{months[i]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Paper Size Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>A4</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full w-[65%] rounded-full bg-blue-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>A3</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full w-[20%] rounded-full bg-purple-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>A5</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full w-[10%] rounded-full bg-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Other</span>
                      <span className="font-medium">5%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full w-[5%] rounded-full bg-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Color vs B&amp;W Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[200px] gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-600">72%</div>
                      <p className="text-sm text-muted-foreground mt-1">Black &amp; White</p>
                    </div>
                    <div className="h-20 w-px bg-border" />
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">28%</div>
                      <p className="text-sm text-muted-foreground mt-1">Color</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold">₹45</p>
                      <p className="text-xs text-muted-foreground">Avg. per page (B&amp;W)</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold">₹12</p>
                      <p className="text-xs text-muted-foreground">Avg. per page (Color)</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold">24</p>
                      <p className="text-xs text-muted-foreground">Avg. daily orders</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold">3.2</p>
                      <p className="text-xs text-muted-foreground">Avg. pages per order</p>
                    </div>
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
