"use client"

import { useState, useEffect, useCallback, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { getShopOrderDetailAction } from "@/lib/actions/dashboard.actions"
import { getPrintersAction } from "@/lib/actions/printer.actions"
import { completePrintJobAction, updateQueuePriorityAction, markQualityCheckPassedAction, failQualityCheckAction } from "@/lib/actions/queue.actions"
import {
  saveOperatorSettingsAction,
  startPrintWithSettingsAction,
  cancelOrderPrintJobAction,
  acceptPayLaterOrderAction,
  reprintOrderAction,
} from "@/lib/actions/operator.actions"
import { toast } from "sonner"
import Link from "next/link"
import {
  Printer, Download, Eye, CheckCircle, Clock, Play, Square,
  RotateCcw, Pause, Settings2, Sliders, Palette, Ruler,
  SunMedium, AlignCenter, Maximize, ScanLine, Grid3X3,
  ArrowLeftRight, BookOpen, FileText, ImageIcon, Loader2,
  AlertCircle, ChevronDown, ChevronUp, Layout, ShieldCheck, AlertTriangle,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface QueueItem {
  id: string
  status: string
  priority: string
  printer: { id: string; name: string } | null
  printerId: string | null
  assignedTo: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

interface FileItem {
  id: string
  name: string
  url: string
  size: number
  pages: number
  type: string
}

interface Customer {
  name: string
  email: string
  phone: string | null
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
  printNotes: string | null
  printSettings: Record<string, unknown> | null
  createdAt: string
  estimatedReadyAt: string | null
  completedAt: string | null
  customer: Customer | null
  files: FileItem[]
  queueItems: QueueItem[]
}

interface PrinterType {
  id: string
  name: string
  model: string
  status: string
  paperSize: string[]
  colorCapable: boolean
  duplexCapable: boolean
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
}

export default function OperatorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [printers, setPrinters] = useState<PrinterType[]>([])
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [startingPrint, setStartingPrint] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)

  const [selectedPrinter, setSelectedPrinter] = useState("")
  const [showPrinterSelect, setShowPrinterSelect] = useState(false)

  const [paperTray, setPaperTray] = useState("auto")
  const [pagesPerSheet, setPagesPerSheet] = useState(1)
  const [layoutDirection, setLayoutDirection] = useState("horizontal")
  const [paperHandling, setPaperHandling] = useState("auto")
  const [scaling, setScaling] = useState(100)
  const [autoRotate, setAutoRotate] = useState(true)
  const [colorMode, setColorMode] = useState("auto")
  const [dpi, setDpi] = useState(300)
  const [margins, setMargins] = useState("normal")
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const fetchData = useCallback(async () => {
    const [orderData, printersData] = await Promise.all([
      getShopOrderDetailAction(id),
      getPrintersAction(),
    ])
    const o = orderData as unknown as OrderDetail | null
    const p = printersData as unknown as PrinterType[]
    setOrder(o)
    setPrinters(p)
    if (o?.printSettings?.operator) {
      const op = o.printSettings.operator as Record<string, unknown>
      setPaperTray((op.paperTray as string) || "auto")
      setPagesPerSheet((op.pagesPerSheet as number) || 1)
      setLayoutDirection((op.layoutDirection as string) || "horizontal")
      setPaperHandling((op.paperHandling as string) || "auto")
      setScaling((op.scaling as number) || 100)
      setAutoRotate(op.autoRotate !== false)
      setColorMode((op.colorMode as string) || "auto")
      setDpi((op.dpi as number) || 300)
      setMargins((op.margins as string) || "normal")
      setBrightness((op.brightness as number) || 0)
      setContrast((op.contrast as number) || 0)
    }
    setLoading(false)
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    const formData = new FormData()
    formData.set("data", JSON.stringify({
      paperTray, pagesPerSheet, layoutDirection, paperHandling,
      scaling, autoRotate, colorMode, dpi, margins,
      brightness, contrast,
    }))
    const result = await saveOperatorSettingsAction(id, null, formData)
    setSavingSettings(false)
    if (result.success) {
      toast.success("Print settings saved")
    } else {
      toast.error(result.error || "Failed to save settings")
    }
  }

  const handleStartPrint = async () => {
    if (!selectedPrinter || !order) {
      toast.error("Select a printer first")
      return
    }
    const queueItem = order.queueItems.find((qi) => qi.status === "QUEUED")
    if (!queueItem) {
      toast.error("No queued item found")
      return
    }
    setStartingPrint(true)
    
    await handleSaveSettings()
    
    const result = await startPrintWithSettingsAction(order.id, queueItem.id, selectedPrinter)
    setStartingPrint(false)
    if (result.success) {
      toast.success("Print job started")
      setShowPrinterSelect(false)
      fetchData()
    } else {
      toast.error(result.error || "Failed to start print")
    }
  }

  const handleComplete = async () => {
    if (!order) return
    const qi = order.queueItems.find((qi) => qi.status === "PRINTING")
    if (!qi) { toast.error("No active print job"); return }
    const result = await completePrintJobAction(qi.id)
    if (result.success) { toast.success("Order completed"); fetchData() }
    else { toast.error(result.error || "Failed") }
  }

  const handleCancel = async () => {
    if (!order) return
    const result = await cancelOrderPrintJobAction(order.id)
    if (result.success) { toast.success("Order cancelled"); fetchData() }
    else { toast.error(result.error || "Failed to cancel") }
  }

  const handlePassQC = async () => {
    if (!order) return
    const result = await markQualityCheckPassedAction(order.id)
    if (result.success) { toast.success("Quality check passed"); fetchData() }
    else { toast.error(result.error || "Failed") }
  }

  const handleFailQC = async () => {
    if (!order) return
    const result = await failQualityCheckAction(order.id)
    if (result.success) { toast.success("Sent back for reprint"); fetchData() }
    else { toast.error(result.error || "Failed") }
  }

  const handleReprint = async () => {
    if (!order) return
    const result = await reprintOrderAction(order.id)
    if (result.success) { toast.success("Added to queue for reprint"); fetchData() }
    else { toast.error(result.error || "Failed") }
  }

  const handleAcceptPayment = async () => {
    if (!order) return
    const result = await acceptPayLaterOrderAction(order.id)
    if (result.success) { toast.success("Payment accepted! Order added to queue."); fetchData() }
    else { toast.error(result.error || "Failed") }
  }

  const handlePriorityChange = async (priority: string) => {
    if (!order) return
    const qi = order.queueItems.find((qi) => ["QUEUED", "PRINTING"].includes(qi.status))
    if (!qi) return
    const result = await updateQueuePriorityAction(qi.id, priority)
    if (result.success) { toast.success("Priority updated"); fetchData() }
  }

  const availablePrinters = printers
  const activeQueueItem = order?.queueItems.find((qi) => ["QUEUED", "PRINTING"].includes(qi.status))
  const isReceived = order?.status === "RECEIVED"
  const isQueued = activeQueueItem?.status === "QUEUED"
  const isPrinting = activeQueueItem?.status === "PRINTING"
  const isQualityCheck = order?.status === "QUALITY_CHECK"
  const isDone = order?.status === "COMPLETED" || order?.status === "CANCELLED" || order?.status === "REFUNDED"
  const customerSettings = order?.printSettings as Record<string, unknown> | null

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar title="Order Details" type="shop" />
        <div className="flex">
          <Sidebar type="shop" />
          <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded w-64" />
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 h-96 bg-muted rounded" />
                <div className="h-96 bg-muted rounded" />
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar title="Order Details" type="shop" />
        <div className="flex">
          <Sidebar type="shop" />
          <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64">
            <div className="text-center py-16 text-muted-foreground">
              <p className="font-medium">Order not found</p>
              <Link href="/shop/orders" className="text-sm text-primary hover:underline mt-2 inline-block">&larr; Back to Orders</Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title={`Order ${order.orderId}`} type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-4 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold font-mono">{order.orderId}</h2>
                <StatusBadge status={order.status.toLowerCase()} />
              </div>
              <Link href="/shop/orders" className="text-sm text-primary hover:underline">&larr; Back to Orders</Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {order.queueItems.length > 0 && (
                <Select
                  value={activeQueueItem?.priority || "NORMAL"}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger className="w-28 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {isReceived && (
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handleAcceptPayment}>
                  <CheckCircle className="h-4 w-4" /> Mark as Paid &amp; Queue
                </Button>
              )}

              {isQueued && !showPrinterSelect && (
                <Button className="gap-2" onClick={() => setShowPrinterSelect(true)}>
                  <Play className="h-4 w-4" /> Print Now
                </Button>
              )}
              {isQueued && showPrinterSelect && (
                <div className="flex items-center gap-2">
                  <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Select printer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePrinters.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center gap-2">
                            <span>{p.name}</span>
                            <StatusBadge status={p.status} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleStartPrint} loading={startingPrint} disabled={!selectedPrinter}>
                    {startingPrint ? "Starting..." : "Start"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowPrinterSelect(false)}>Cancel</Button>
                </div>
              )}

              {isPrinting && (
                <>
                  <Button className="gap-2" onClick={handleComplete}>
                    <CheckCircle className="h-4 w-4" /> Finish Printing
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleCancel}>
                    <Square className="h-4 w-4" /> Cancel
                  </Button>
                </>
              )}

              {isQualityCheck && (
                <>
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handlePassQC}>
                    <ShieldCheck className="h-4 w-4" /> Pass QC
                  </Button>
                  <Button variant="destructive" className="gap-2" onClick={handleFailQC}>
                    <AlertTriangle className="h-4 w-4" /> Fail QC
                  </Button>
                </>
              )}

              {isDone && (
                <Button variant="outline" className="gap-2" onClick={handleReprint}>
                  <RotateCcw className="h-4 w-4" /> Reprint
                </Button>
              )}
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">
              <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-primary" /> Operator Controls
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={handleSaveSettings}
                        loading={savingSettings}
                      >
                        Save Settings
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                      >
                        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {showAdvanced ? "Less" : "More"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5 text-xs">
                          <Printer className="h-3.5 w-3.5" /> Printer
                        </Label>
                        <Select value={selectedPrinter || order.queueItems.find(qi => qi.printer)?.printer?.id || ""} onValueChange={(v) => { setSelectedPrinter(v); setShowPrinterSelect(true) }}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Assign printer..." />
                          </SelectTrigger>
                          <SelectContent>
                            {printers.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                <div className="flex items-center gap-2">
                                  <span>{p.name}</span>
                                  <Badge variant={p.status === "ONLINE" || p.status === "online" ? "success" : p.status === "BUSY" || p.status === "busy" ? "warning" : "pending"} className="text-[10px] px-1.5 py-0">
                                    {p.status}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5 text-xs">
                          <ScanLine className="h-3.5 w-3.5" /> Paper Tray
                        </Label>
                        <Select value={paperTray} onValueChange={setPaperTray}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto Select</SelectItem>
                            <SelectItem value="tray-1">Tray 1</SelectItem>
                            <SelectItem value="tray-2">Tray 2</SelectItem>
                            <SelectItem value="tray-3">Tray 3</SelectItem>
                            <SelectItem value="manual">Manual Feed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5 text-xs">
                          <Grid3X3 className="h-3.5 w-3.5" /> Pages per Sheet
                        </Label>
                        <Select value={String(pagesPerSheet)} onValueChange={(v) => setPagesPerSheet(Number(v))}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 4, 6, 8, 9, 16].map((n) => (
                              <SelectItem key={n} value={String(n)}>{n} per sheet</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5 text-xs">
                          <ArrowLeftRight className="h-3.5 w-3.5" /> Layout Direction
                        </Label>
                        <Select value={layoutDirection} onValueChange={setLayoutDirection}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="horizontal">Horizontal</SelectItem>
                            <SelectItem value="reverse-horizontal">Reverse Horizontal</SelectItem>
                            <SelectItem value="vertical">Vertical</SelectItem>
                            <SelectItem value="reverse-vertical">Reverse Vertical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5 text-xs">
                          <BookOpen className="h-3.5 w-3.5" /> Paper Handling
                        </Label>
                        <Select value={paperHandling} onValueChange={setPaperHandling}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto</SelectItem>
                            <SelectItem value="manual">Manual Feed</SelectItem>
                            <SelectItem value="tray">Tray</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5 text-xs">
                          <Maximize className="h-3.5 w-3.5" /> Scaling
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="range"
                            min={25}
                            max={400}
                            value={scaling}
                            onChange={(e) => setScaling(Number(e.target.value))}
                            className="h-2 flex-1"
                          />
                          <span className="text-xs font-mono w-10 text-right">{scaling}%</span>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t pt-4 mt-4 space-y-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                              <Label className="flex items-center gap-2 text-xs cursor-pointer">
                                <RotateCcw className="h-3.5 w-3.5" /> Auto Rotate
                              </Label>
                              <Switch checked={autoRotate} onCheckedChange={setAutoRotate} />
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-1.5 text-xs">
                                <Palette className="h-3.5 w-3.5" /> Color Mode
                              </Label>
                              <Select value={colorMode} onValueChange={setColorMode}>
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="auto">Auto</SelectItem>
                                  <SelectItem value="color">Color</SelectItem>
                                  <SelectItem value="grayscale">Grayscale</SelectItem>
                                  <SelectItem value="monochrome">Monochrome</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-1.5 text-xs">
                                <Layout className="h-3.5 w-3.5" /> DPI
                              </Label>
                              <Select value={String(dpi)} onValueChange={(v) => setDpi(Number(v))}>
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[150, 200, 300, 600, 1200].map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n} DPI</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-1.5 text-xs">
                                <Ruler className="h-3.5 w-3.5" /> Margins
                              </Label>
                              <Select value={margins} onValueChange={setMargins}>
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="minimum">Minimum</SelectItem>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-1.5 text-xs">
                                <SunMedium className="h-3.5 w-3.5" /> Brightness
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="range"
                                  min={-100}
                                  max={100}
                                  value={brightness}
                                  onChange={(e) => setBrightness(Number(e.target.value))}
                                  className="h-2 flex-1"
                                />
                                <span className="text-xs font-mono w-10 text-right">{brightness > 0 ? "+" : ""}{brightness}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-1.5 text-xs">
                                <Sliders className="h-3.5 w-3.5" /> Contrast
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="range"
                                  min={-100}
                                  max={100}
                                  value={contrast}
                                  onChange={(e) => setContrast(Number(e.target.value))}
                                  className="h-2 flex-1"
                                />
                                <span className="text-xs font-mono w-10 text-right">{contrast > 0 ? "+" : ""}{contrast}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlignCenter className="h-5 w-5 text-primary" /> Order Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { key: "CREATED", label: "Order Placed", time: order.createdAt, done: true },
                        { key: "QUEUED", label: "Added to Queue", time: order.queueItems.find((q) => q.status !== "QUEUED" || order.status !== "PENDING")?.createdAt || null, done: order.queueItems.some((q) => ["QUEUED", "PRINTING", "COMPLETED"].includes(q.status)) },
                        { key: "PRINTING", label: "Printing", time: order.queueItems.find((q) => q.status === "PRINTING" || q.status === "COMPLETED")?.startedAt || null, done: order.queueItems.some((q) => q.status === "COMPLETED"), active: order.queueItems.some((q) => q.status === "PRINTING") },
                        { key: "QC", label: "Quality Check", time: order.queueItems.find((q) => q.status === "COMPLETED")?.completedAt || null, done: order.status === "READY" || order.status === "COMPLETED", active: order.status === "QUALITY_CHECK" },
                        { key: "READY", label: isDone && order.status !== "CANCELLED" ? "Ready for Pickup" : "Cancelled", time: order.queueItems.find((q) => q.status === "COMPLETED")?.completedAt || null, done: ["READY", "COMPLETED"].includes(order.status) || order.queueItems.some((q) => q.status === "COMPLETED") },
                        { key: "COMPLETED", label: "Picked Up", time: order.completedAt || null, done: order.status === "COMPLETED" },
                      ].map((step, i, arr) => (
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
                            <p className="font-medium text-sm">{step.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {step.time ? formatDateTime(step.time) : "Pending"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {order.files.length > 0 && (
                <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
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
              <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Customer</span><span className="font-medium">{order.customer?.name || order.customer?.email || "—"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Email</span><span className="font-medium">{order.customer?.email || "—"}</span></div>
                    {order.customer?.phone && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Phone</span><span className="font-medium">{order.customer.phone}</span></div>}
                    <div className="border-t my-2" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-muted/30 p-2.5"><p className="text-xs text-muted-foreground">Pages</p><p className="font-medium">{order.pages}</p></div>
                      <div className="rounded-lg bg-muted/30 p-2.5"><p className="text-xs text-muted-foreground">Copies</p><p className="font-medium">{order.copies}</p></div>
                      <div className="rounded-lg bg-muted/30 p-2.5"><p className="text-xs text-muted-foreground">Color</p><p className="font-medium">{order.color}</p></div>
                      <div className="rounded-lg bg-muted/30 p-2.5"><p className="text-xs text-muted-foreground">Paper Size</p><p className="font-medium">{order.paperSize}</p></div>
                      <div className="rounded-lg bg-muted/30 p-2.5"><p className="text-xs text-muted-foreground">Sides</p><p className="font-medium">{order.sides}</p></div>
                      {order.finishing && <div className="rounded-lg bg-muted/30 p-2.5"><p className="text-xs text-muted-foreground">Finishing</p><p className="font-medium">{order.finishing}</p></div>}
                    </div>
                    {customerSettings && (
                      <>
                        <div className="border-t my-2" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Settings</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {typeof customerSettings.orientation === "string" && <div className="rounded-lg bg-muted/20 p-2"><p className="text-muted-foreground">Orientation</p><p className="font-medium capitalize">{customerSettings.orientation}</p></div>}
                          {typeof customerSettings.printQuality === "string" && <div className="rounded-lg bg-muted/20 p-2"><p className="text-muted-foreground">Quality</p><p className="font-medium capitalize">{customerSettings.printQuality}</p></div>}
                          {customerSettings.pageRange === "custom" && typeof customerSettings.customPageRange === "string" && <div className="rounded-lg bg-muted/20 p-2 col-span-2"><p className="text-muted-foreground">Page Range</p><p className="font-medium">{customerSettings.customPageRange}</p></div>}
                          {Array.isArray(customerSettings.finishingOptions) && (customerSettings.finishingOptions as string[]).length > 0 && (
                            <div className="rounded-lg bg-muted/20 p-2 col-span-2">
                              <p className="text-muted-foreground">Finishing</p>
                              <div className="flex gap-1 mt-1">
                                {(customerSettings.finishingOptions as string[]).map((opt) => (
                                  <Badge key={opt} variant="secondary" className="text-[10px] capitalize">{opt}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg text-primary">{formatCurrency(order.total)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" /> Print Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="queue">
                      <TabsList className="w-full">
                        <TabsTrigger value="queue" className="flex-1">Queue History</TabsTrigger>
                        <TabsTrigger value="print" className="flex-1">Print Notes</TabsTrigger>
                      </TabsList>
                      <TabsContent value="queue" className="pt-3">
                        {order.queueItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">Not yet added to queue</p>
                        ) : (
                          <div className="space-y-2">
                            {order.queueItems.map((qi) => (
                              <div key={qi.id} className="flex items-center justify-between p-2.5 rounded-lg border text-sm">
                                <div className="flex items-center gap-2">
                                  <StatusBadge status={qi.status} />
                                  {qi.printer && <span className="text-muted-foreground">{qi.printer.name}</span>}
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">{formatDateTime(qi.createdAt)}</p>
                                  {qi.assignedTo && <p className="text-[10px] text-muted-foreground">by {qi.assignedTo}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="print" className="pt-3">
                        <pre className="whitespace-pre-wrap text-sm font-mono text-muted-foreground bg-muted/30 rounded-lg p-3 min-h-[80px]">
                          {order.printNotes || "No print logs yet"}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" /> Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.notes && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Customer Notes</p>
                        <p className="text-sm bg-muted/30 rounded-lg p-3">{order.notes}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Internal Print Notes</p>
                      <p className="text-sm bg-muted/30 rounded-lg p-3">{order.printNotes || "No internal notes"}</p>
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
                <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/30 p-6 md:p-12">
                  <FileText className="h-20 w-20 text-primary/40 mb-4" />
                  <p className="text-lg font-medium">Document Preview</p>
                  <p className="text-sm text-muted-foreground mt-1">{previewFile?.name}</p>
                  <a href={previewFile?.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="default" size="sm" className="mt-4">Open Document</Button>
                  </a>
                </div>
              )
            })()}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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
