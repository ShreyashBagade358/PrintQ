"use client"

import { useState, useEffect, useCallback, use } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { getCustomerOrderDetailAction } from "@/lib/actions/customer-order.actions"
import Link from "next/link"
import {
  FileText, Clock, CheckCircle, Download, Eye, Loader2,
  ImageIcon, Printer, ArrowLeft,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface FileItem {
  id: string
  name: string
  url: string
  size: number
  pages: number
  type: string
}

interface QueueItem {
  id: string
  status: string
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  printer: { id: string; name: string } | null
}

interface OrderDetail {
  id: string
  orderId: string
  status: string
  pages: number
  copies: number
  color: string
  paperSize: string
  sides: string
  finishing: string | null
  amount: number
  discount: number
  total: number
  notes: string | null
  printSettings: Record<string, unknown> | null
  estimatedReadyAt: string | null
  completedAt: string | null
  createdAt: string
  shopName: string | null
  customer: { name: string; email: string; phone: string | null } | null
  files: FileItem[]
  queueItems: QueueItem[]
}

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)

  const fetchData = useCallback(async () => {
    const data = await getCustomerOrderDetailAction(id)
    setOrder(data as unknown as OrderDetail | null)
    setLoading(false)
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const timeline = [
    { key: "CREATED", label: "Order Placed", done: true, time: order?.createdAt || null },
    {
      key: "IN_QUEUE",
      label: "In Queue",
      done: !!order?.queueItems.some((q) => ["QUEUED", "PRINTING", "COMPLETED"].includes(q.status)),
      time: order?.queueItems.find((q) => q.status !== "QUEUED")?.createdAt || order?.queueItems[0]?.createdAt || null,
      active: order?.status === "IN_QUEUE" || order?.status === "PROCESSING",
    },
    {
      key: "PRINTING",
      label: "Printing",
      done: order?.queueItems.some((q) => q.status === "COMPLETED"),
      time: order?.queueItems.find((q) => q.status === "PRINTING" || q.status === "COMPLETED")?.startedAt || null,
      active: order?.queueItems.some((q) => q.status === "PRINTING"),
    },
    {
      key: "QC",
      label: "Quality Check",
      done: order?.status === "READY" || order?.status === "COMPLETED",
      time: order?.queueItems.find((q) => q.status === "COMPLETED")?.completedAt || null,
      active: order?.status === "QUALITY_CHECK",
    },
    {
      key: "READY",
      label: "Ready for Pickup",
      done: order?.status === "READY" || order?.status === "COMPLETED",
      time: order?.queueItems.find((q) => q.status === "COMPLETED")?.completedAt || null,
      active: order?.status === "READY",
    },
    {
      key: "COMPLETED",
      label: "Picked Up",
      done: order?.status === "COMPLETED",
      time: order?.completedAt || null,
    },
  ]

  const isCancelled = order?.status === "CANCELLED" || order?.status === "REFUNDED"

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar title="Order Details" type="customer" />
        <div className="flex">
          <Sidebar type="customer" />
          <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar title="Order Details" type="customer" />
        <div className="flex">
          <Sidebar type="customer" />
          <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
            <div className="text-center py-16 text-muted-foreground space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="font-medium">Order not found</p>
              <Link href="/customer/orders" className="text-sm text-primary hover:underline inline-block">&larr; Back to Orders</Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title={`Order ${order.orderId}`} type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-4 lg:p-8 ml-16 lg:ml-64 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold font-mono">{order.orderId}</h2>
                <StatusBadge status={isCancelled ? "cancelled" : order.status.toLowerCase()} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Link href="/customer/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Back to Orders
                </Link>
                {order.shopName && (
                  <>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Printer className="h-3 w-3" /> {order.shopName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" /> Order Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {timeline.map((step, i, arr) => {
                        if (isCancelled && step.key === "READY") {
                          return (
                            <div key={step.key} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">
                                  <div className="h-2 w-2 rounded-full bg-current" />
                                </div>
                                {i < arr.length - 1 && <div className="w-0.5 h-8 bg-muted" />}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-red-600">Cancelled</p>
                                <p className="text-xs text-muted-foreground">{step.time ? formatDateTime(step.time) : "—"}</p>
                              </div>
                            </div>
                          )
                        }
                        if (isCancelled && !step.done) return null
                        return (
                          <div key={step.key} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                step.done ? "bg-emerald-100 text-emerald-600"
                                  : step.active ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                <div className={`h-2 w-2 rounded-full ${step.done || step.active ? "bg-current" : "bg-muted-foreground"}`} />
                              </div>
                              {i < arr.length - 1 && <div className="w-0.5 h-8 bg-muted" />}
                            </div>
                            <div>
                              <p className={`font-medium text-sm ${step.active ? "text-primary" : ""}`}>{step.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {step.done && step.time ? formatDateTime(step.time) : step.active ? "In progress..." : "Pending"}
                              </p>
                              {step.key === "PRINTING" && step.active && order.queueItems.find((q) => q.status === "PRINTING")?.printer && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Printer: {order.queueItems.find((q) => q.status === "PRINTING")?.printer?.name}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {order.files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" /> Files ({order.files.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {order.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 cursor-pointer transition-colors"
                            onClick={() => setPreviewFile(file)}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {file.type?.includes("image") ? (
                                <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden border">
                                  <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                                </div>
                              ) : (
                                <div className="h-10 w-10 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{file.pages} pages</p>
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setPreviewFile(file) }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-xs text-muted-foreground">Pages</p>
                        <p className="font-medium">{order.pages}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-xs text-muted-foreground">Copies</p>
                        <p className="font-medium">{order.copies}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-xs text-muted-foreground">Color</p>
                        <p className="font-medium">{order.color}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-xs text-muted-foreground">Paper Size</p>
                        <p className="font-medium">{order.paperSize}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-xs text-muted-foreground">Sides</p>
                        <p className="font-medium">{order.sides}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-xs text-muted-foreground">Finishing</p>
                        <p className="font-medium">{order.finishing || "None"}</p>
                      </div>
                    </div>

                    {order.printSettings && (
                      <>
                        <div className="border-t pt-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Settings</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {typeof order.printSettings.orientation === "string" && (
                              <div className="rounded-lg bg-muted/20 p-2">
                                <p className="text-muted-foreground">Orientation</p>
                                <p className="font-medium capitalize">{order.printSettings.orientation as string}</p>
                              </div>
                            )}
                            {typeof order.printSettings.printQuality === "string" && (
                              <div className="rounded-lg bg-muted/20 p-2">
                                <p className="text-muted-foreground">Quality</p>
                                <p className="font-medium capitalize">{order.printSettings.printQuality as string}</p>
                              </div>
                            )}
                            {order.printSettings.pageRange === "custom" && typeof order.printSettings.customPageRange === "string" && (
                              <div className="rounded-lg bg-muted/20 p-2 col-span-2">
                                <p className="text-muted-foreground">Page Range</p>
                                <p className="font-medium">{order.printSettings.customPageRange}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="border-t pt-3 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(order.amount)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Discount</span>
                          <span className="text-emerald-600">-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg pt-1 border-t">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(order.total)}</span>
                      </div>
                    </div>

                    {order.estimatedReadyAt && (
                      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 flex items-center gap-2 text-sm mt-2">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <span className="font-medium">Estimated ready: </span>
                          <span>{formatDateTime(order.estimatedReadyAt)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {order.notes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" /> Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm bg-muted/30 rounded-lg p-3">{order.notes}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" /> Order Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Placed on</span>
                      <span className="font-medium">{formatDateTime(order.createdAt)}</span>
                    </div>
                    {order.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed on</span>
                        <span className="font-medium">{formatDateTime(order.completedAt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shop</span>
                      <span className="font-medium">{order.shopName || "—"}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={!!previewFile} onOpenChange={(o) => { if (!o) setPreviewFile(null) }}>
        <DialogContent className={previewFile?.type?.includes("pdf") ? "sm:max-w-4xl" : "sm:max-w-2xl"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewFile?.type?.includes("image") ? <ImageIcon className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const type = previewFile?.type || ""
              const name = previewFile?.name || ""
              const isImage = type.includes("image") || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name)
              const isPdf = type.includes("pdf") || name.toLowerCase().endsWith(".pdf")

              if (isImage) {
                return (
                  <div className="flex items-center justify-center rounded-lg border bg-muted/30 p-4">
                    <img src={previewFile!.url} alt={previewFile!.name} className="max-h-[400px] max-w-full rounded-lg object-contain shadow-sm" />
                  </div>
                )
              }

              if (isPdf) {
                return (
                  <div className="rounded-lg border bg-muted/30 overflow-hidden">
                    <iframe
                      src={previewFile!.url}
                      className="w-full h-[600px]"
                      title={previewFile!.name}
                    />
                    <div className="flex justify-center gap-3 p-3 border-t bg-background">
                      <a href={previewFile!.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="default" size="sm">Open in New Tab</Button>
                      </a>
                      <a href={previewFile!.url} download={previewFile!.name} rel="noopener noreferrer">
                        <Button variant="outline" size="sm">Download</Button>
                      </a>
                    </div>
                  </div>
                )
              }

              return (
                <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/30 p-12">
                  <FileText className="h-20 w-20 text-primary/40 mb-4" />
                  <p className="text-lg font-medium">Document Preview</p>
                  <p className="text-sm text-muted-foreground mt-1">{previewFile?.name}</p>
                  <a href={previewFile?.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="default" size="sm" className="mt-4">Open Document</Button>
                  </a>
                </div>
              )
            })()}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-muted-foreground text-xs">File size</p>
                <p className="font-medium">{previewFile ? (previewFile.size / 1024 / 1024).toFixed(1) : 0} MB</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-muted-foreground text-xs">Pages</p>
                <p className="font-medium">{previewFile?.pages || 0}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
