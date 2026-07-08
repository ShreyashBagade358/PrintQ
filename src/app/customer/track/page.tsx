"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Phone, Share2, CheckCircle, Clock, Printer, Package, Check, Loader2, AlertCircle, FileText } from "lucide-react"
import { getTrackOrderAction } from "@/lib/actions/customer-order.actions"
import { formatCurrency, formatTime } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"

interface QueueItem {
  id: string
  status: string
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  printer: { id: string; name: string } | null
}

interface FileItem {
  id: string
  name: string
  url: string
  size: number
  pages: number
  type: string
}

interface OrderData {
  id: string
  orderId: string
  status: string
  pages: number
  copies: number
  color: string
  paperSize: string
  total: number
  estimatedReadyAt: string | null
  completedAt: string | null
  createdAt: string
  customer: { name: string; email: string; phone: string | null } | null
  files: FileItem[]
  queueItems: QueueItem[]
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Order Placed",
  RECEIVED: "Payment Received",
  IN_QUEUE: "In Queue",
  PROCESSING: "Processing",
  PRINTING: "Printing",
  QUALITY_CHECK: "Quality Check",
  READY: "Ready for Pickup",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  RECEIVED: "bg-blue-100 text-blue-800",
  IN_QUEUE: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  PRINTING: "bg-indigo-100 text-indigo-800",
  QUALITY_CHECK: "bg-orange-100 text-orange-800",
  READY: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-red-100 text-red-800",
}

function getTimelineSteps(status: string, queueItems: QueueItem[], createdAt: string) {
  const queueStart = queueItems.find((q) => q.status !== "QUEUED" || queueItems.length > 0)?.createdAt || null
  const printStart = queueItems.find((q) => q.status === "PRINTING" || q.status === "COMPLETED")?.startedAt || null
  const printEnd = queueItems.find((q) => q.status === "COMPLETED")?.completedAt || null
  const isCancelled = status === "CANCELLED" || status === "REFUNDED"

  return [
    { key: "PLACED", label: "Received", time: createdAt, done: true },
    { key: "PROCESSING", label: "Processing", time: queueStart, done: status !== "PENDING" },
    { key: "PRINTING", label: "Printing", time: printStart, done: !!printEnd || status === "READY" || status === "COMPLETED", active: status === "PRINTING" || status === "QUALITY_CHECK" || (status === "IN_QUEUE" && !queueStart) },
    { key: "READY", label: isCancelled ? "Cancelled" : "Ready", time: isCancelled ? printEnd : printEnd, done: status === "READY" || status === "COMPLETED" || isCancelled },
    { key: "DONE", label: "Completed", time: null, done: status === "COMPLETED", hide: isCancelled },
  ]
}

function TrackOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("order") || "")
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [trackedId, setTrackedId] = useState(searchParams.get("order") || "")

  const fetchOrder = useCallback(async (orderId: string) => {
    setLoading(true)
    setError("")
    const data = await getTrackOrderAction(orderId)
    if (data) {
      setOrder(data as unknown as OrderData)
    } else {
      setOrder(null)
      setError("Order not found. Please check the order ID.")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const initial = searchParams.get("order")
    if (initial) {
      setQuery(initial)
      setTrackedId(initial)
      fetchOrder(initial)
    }
  }, [searchParams, fetchOrder])

  useEffect(() => {
    if (!trackedId) return
    const interval = setInterval(() => fetchOrder(trackedId), 10000)
    return () => clearInterval(interval)
  }, [trackedId, fetchOrder])

  const handleSearch = () => {
    const trimmed = query.trim().toUpperCase()
    if (!trimmed) return
    setTrackedId(trimmed)
    router.replace(`/customer/track?order=${trimmed}`, { scroll: false })
    fetchOrder(trimmed)
  }

  const statusBadgeColor = order ? STATUS_BADGE[order.status] || "bg-gray-100 text-gray-800" : ""
  const timelineSteps = order ? getTimelineSteps(order.status, order.queueItems, order.createdAt) : []

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Track Order" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-4 lg:p-8 ml-16 lg:ml-64">
          <div className="mx-auto max-w-2xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <form
                onSubmit={(e) => { e.preventDefault(); handleSearch() }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter Order ID to track..."
                  className="pl-9 h-12 text-base"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </form>
            </motion.div>

            {loading && !order && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </motion.div>
            )}

            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold">{order.orderId}</h2>
                        <p className="text-sm text-muted-foreground">
                          {order.pages} pages, {order.color}, {order.paperSize}
                        </p>
                      </div>
                      <Badge className={statusBadgeColor}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </div>

                    <div className="space-y-0">
                      {timelineSteps.filter((s) => !s.hide).map((step, index) => {
                        const icons: Record<string, typeof CheckCircle> = {
                          PLACED: CheckCircle,
                          PROCESSING: Clock,
                          PRINTING: Printer,
                          READY: Package,
                          DONE: Check,
                        }
                        const Icon = icons[step.key] || CheckCircle
                        const isLast = index === timelineSteps.filter((s) => !s.hide).length - 1
                        return (
                          <div key={step.key} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                step.done
                                  ? "bg-emerald-100 text-emerald-600"
                                  : step.active
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              {!isLast && (
                                <div className={`w-0.5 h-12 ${
                                  step.done ? "bg-emerald-200" : "bg-muted"
                                }`} />
                              )}
                            </div>
                            <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
                              <p className={`font-medium ${
                                step.done || step.active ? "text-foreground" : "text-muted-foreground"
                              }`}>{step.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {step.time ? formatTime(step.time) : step.done ? "Done" : "Pending"}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {order.estimatedReadyAt && status !== "COMPLETED" && status !== "CANCELLED" && (
                      <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm text-center">
                        Estimated ready by <strong>{formatTime(order.estimatedReadyAt)}</strong>
                      </div>
                    )}

                    <div className="mt-6 flex gap-3">
                      <Button variant="outline" className="flex-1 gap-2" asChild>
                        <a href={`tel:${order.customer?.phone || ""}`}>
                          <Phone className="h-4 w-4" /> Call Shop
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/customer/track?order=${order.orderId}`)
                        }}
                      >
                        <Share2 className="h-4 w-4" /> Share Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <DashboardNavbar title="Track Order" type="customer" />
        <div className="flex">
          <Sidebar type="customer" />
          <main className="flex-1 p-4 lg:p-8 ml-16 lg:ml-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  )
}
