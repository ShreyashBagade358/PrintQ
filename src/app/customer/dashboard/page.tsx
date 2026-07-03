"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, ShoppingCart, FileText, Clock, TrendingUp, ArrowRight, QrCode, ScanLine, Store, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function CustomerDashboardPage() {
  const [connectedShop, setConnectedShop] = useState<{ name: string; id: string } | null>(null)

  useEffect(() => {
    const shopId = sessionStorage.getItem("connectedShopId")
    const shopName = sessionStorage.getItem("connectedShopName")
    if (shopId && shopName) setConnectedShop({ id: shopId, name: shopName })
  }, [])

  const handleDisconnect = () => {
    sessionStorage.removeItem("connectedShopId")
    sessionStorage.removeItem("connectedShopName")
    setConnectedShop(null)
    toast.success("Disconnected from shop")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Dashboard" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64 space-y-6">
          {connectedShop && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-primary/20 bg-gradient-to-r from-primary/[0.04] to-transparent">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Connected to {connectedShop.name}</p>
                      <p className="text-xs text-muted-foreground">Orders will be sent to this shop</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/customer/upload">
                      <Button size="sm" className="gap-2">
                        <FileText className="h-4 w-4" /> Place Order
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleDisconnect}>Disconnect</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShoppingCart, label: "Total Orders", value: "12" },
              { icon: FileText, label: "Pages Printed", value: "245" },
              { icon: IndianRupee, label: "Total Spent", value: "₹480" },
              { icon: Clock, label: "Active Orders", value: "2" },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: "ORD-A1B2C3", date: "Jan 15", status: "Printing", amount: "₹20" },
                    { id: "ORD-D4E5F6", date: "Jan 14", status: "Ready", amount: "₹100" },
                    { id: "ORD-G7H8I9", date: "Jan 10", status: "Completed", amount: "₹50" },
                  ].map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-mono font-medium text-sm">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{order.amount}</p>
                        <p className="text-xs text-muted-foreground">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/customer/orders">
                  <Button variant="ghost" className="w-full mt-3 gap-2">
                    View All Orders <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/customer/upload">
                  <Button className="w-full gap-2" size="lg">
                    <FileText className="h-5 w-5" /> New Print Job
                  </Button>
                </Link>
                <Link href="/scan">
                  <Button variant="outline" className="w-full gap-2" size="lg">
                    <ScanLine className="h-5 w-5" /> Scan Shop QR
                  </Button>
                </Link>
                <Link href="/customer/track">
                  <Button variant="outline" className="w-full gap-2" size="lg">
                    <ExternalLink className="h-5 w-5" /> Track Order
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
