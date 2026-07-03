"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, CreditCard, ShoppingCart, Users, TrendingUp, TrendingDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"

const stats = [
  { icon: IndianRupee, label: "Total Revenue", value: "₹48,50,000", change: "+18.5%", trend: "up" },
  { icon: CreditCard, label: "Active Subscriptions", value: "486", change: "+12.3%", trend: "up" },
  { icon: ShoppingCart, label: "Total Orders", value: "52,450", change: "+22.1%", trend: "up" },
  { icon: Users, label: "Total Shops", value: "512", change: "+8.7%", trend: "up" },
]

const recentShops = [
  { name: "PrintPro Delhi", owner: "Rajesh Kumar", plan: "Professional", status: "active", date: "Today" },
  { name: "CopyCat Mumbai", owner: "Priya Sharma", plan: "Starter", status: "active", date: "Yesterday" },
  { name: "Digital Prints", owner: "Amit Patel", plan: "Business", status: "pending", date: "2 days ago" },
]

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Admin Dashboard" type="admin" />
      <div className="flex">
        <Sidebar type="admin" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64 space-y-6">
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
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <TrendingUp className="h-3 w-3" /> {stat.change}
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
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <div className="w-full h-full bg-gradient-to-t from-primary/5 to-transparent rounded-lg flex items-end justify-around p-4">
                      {[35, 50, 42, 65, 55, 70, 60, 75, 68, 80, 72, 85].map((h, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className="w-6 bg-primary/60 rounded-t-md" style={{ height: `${h}%` }} />
                          <span className="text-[10px] text-muted-foreground">M{i + 1}</span>
                        </div>
                      ))}
                    </div>
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
                  <CardTitle>Subscription Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { plan: "Business", count: 85, percentage: 17, color: "bg-purple-500" },
                    { plan: "Professional", count: 245, percentage: 48, color: "bg-primary" },
                    { plan: "Starter", count: 156, percentage: 31, color: "bg-emerald-500" },
                    { plan: "Free / Trial", count: 26, percentage: 5, color: "bg-gray-400" },
                  ].map((item) => (
                    <div key={item.plan}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.plan}</span>
                        <span className="font-medium">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Shop Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shop Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentShops.map((shop) => (
                      <TableRow key={shop.name}>
                        <TableCell className="font-medium">{shop.name}</TableCell>
                        <TableCell>{shop.owner}</TableCell>
                        <TableCell>{shop.plan}</TableCell>
                        <TableCell><StatusBadge status={shop.status} /></TableCell>
                        <TableCell className="text-muted-foreground">{shop.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
