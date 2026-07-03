"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, ChevronRight } from "lucide-react"
import { getShopOrdersAction } from "@/lib/actions/dashboard.actions"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OrderItem {
  id: string
  orderId: string
  status: string
  pages: number
  copies: number
  color: string
  total: number
  createdAt: string
  customer: { name: string; email: string } | null
}

export default function ShopOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("all")

  const fetchData = useCallback(async () => {
    const data = await getShopOrdersAction()
    setOrders(data as unknown as OrderItem[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const activeStatuses = ["PENDING", "RECEIVED", "PROCESSING", "PRINTING", "READY"]
  const tabbed = tab === "all" ? orders
    : tab === "active" ? orders.filter((o) => activeStatuses.includes(o.status))
    : tab === "completed" ? orders.filter((o) => o.status === "COMPLETED")
    : tab === "cancelled" ? orders.filter((o) => ["CANCELLED", "REFUNDED"].includes(o.status))
    : orders

  const searched = tabbed.filter(
    (o) =>
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.email?.toLowerCase().includes(search.toLowerCase()),
  )

  const activeCount = orders.filter((o) => activeStatuses.includes(o.status)).length
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length
  const cancelledCount = orders.filter((o) => ["CANCELLED", "REFUNDED"].includes(o.status)).length

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar title="Orders" type="shop" />
        <div className="flex">
          <Sidebar type="shop" />
          <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded w-64" />
              <div className="h-10 bg-muted rounded w-96" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Orders" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
          >
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>Refresh</Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="all" onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({cancelledCount})</TabsTrigger>
              </TabsList>
              <TabsContent value={tab} className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    {searched.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="font-medium">No orders found</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Pages</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searched.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono font-medium">{order.orderId}</TableCell>
                              <TableCell>{order.customer?.name || order.customer?.email || "—"}</TableCell>
                              <TableCell>{order.pages} × {order.copies}</TableCell>
                              <TableCell>{formatCurrency(order.total)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</TableCell>
                              <TableCell><StatusBadge status={order.status.toLowerCase()} /></TableCell>
                              <TableCell>
                                <Link href={`/shop/orders/${order.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
