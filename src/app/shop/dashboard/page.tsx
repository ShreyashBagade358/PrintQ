"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, ShoppingCart, FileText, Clock, TrendingUp, TrendingDown, QrCode } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { getShopDashboardAction } from "@/lib/actions/dashboard.actions"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { QrDisplay } from "@/components/shop/qr-display"
import Link from "next/link"
import { TutorialProvider } from "@/components/onboarding/tutorial-provider"

interface DashboardData {
  stats: {
    totalOrders: number
    totalRevenue: number
    pagesPrinted: number
    pendingOrders: number
    queueCount: number
    printerCount: number
    onlinePrinters: number
  }
  recentOrders: {
    id: string
    orderId: string
    status: string
    pages: number
    total: number
    createdAt: string
    customer: { name: string; email: string } | null
  }[]
}

export default function ShopDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const result = await getShopDashboardAction()
    setData(result as unknown as DashboardData)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  const statCards = data ? [
    { icon: IndianRupee, label: "Revenue", value: formatCurrency(data.stats.totalRevenue), change: "", trend: "up" as const },
    { icon: ShoppingCart, label: "Total Orders", value: String(data.stats.totalOrders), change: "", trend: "up" as const },
    { icon: FileText, label: "Pages Printed", value: String(data.stats.pagesPrinted), change: "", trend: "up" as const },
    { icon: Clock, label: "Pending Orders", value: String(data.stats.pendingOrders), change: "", trend: "down" as const },
  ] : []

  const secondaryStats = data ? [
    { label: "Printers Online", value: `${data.stats.onlinePrinters} / ${data.stats.printerCount}` },
    { label: "Queue Items", value: String(data.stats.queueCount) },
  ] : []

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar title="Dashboard" type="shop" />
        <div className="flex">
          <Sidebar type="shop" />
          <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64">
            <div className="animate-pulse space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 bg-muted rounded-lg" />
                ))}
              </div>
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Dashboard" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="shop-stats">
            {statCards.map((stat, index) => {
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
                        {stat.change && (
                          <div className={`flex items-center gap-1 text-xs font-medium ${
                            stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                          }`}>
                            {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {stat.change}
                          </div>
                        )}
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

          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {secondaryStats.map((stat) => (
                    <div key={stat.label} className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["PENDING", "RECEIVED", "PROCESSING", "PRINTING", "READY", "COMPLETED"].map((status) => {
                    const count = data?.recentOrders.filter((o) => o.status === status).length || 0
                    const pct = data?.recentOrders.length ? Math.round((count / data.recentOrders.length) * 100) : 0
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{status.toLowerCase()}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className={`h-full rounded-full ${
                            status === "PENDING" ? "bg-yellow-500"
                            : status === "RECEIVED" ? "bg-blue-500"
                            : status === "PROCESSING" ? "bg-indigo-500"
                            : status === "PRINTING" ? "bg-purple-500"
                            : status === "READY" ? "bg-green-500"
                            : "bg-emerald-500"
                          }`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div data-tour="shop-qr"><QrDisplay /></div>

          <Card data-tour="shop-orders-table">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="font-medium">No orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">
                          <Link href={`/shop/orders/${order.id}`} className="hover:underline">
                            {order.orderId}
                          </Link>
                        </TableCell>
                        <TableCell>{order.customer?.name || order.customer?.email || "—"}</TableCell>
                        <TableCell>{order.pages}</TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</TableCell>
                        <TableCell><StatusBadge status={order.status.toLowerCase()} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <TutorialProvider />
    </div>
  )
}
