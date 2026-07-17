"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPrintersAction, addPrinterAction, updatePrinterStatusAction, updatePrinterLevelsAction, removePrinterAction } from "@/lib/actions/printer.actions"
import { Plus, Printer, Search, Wifi, WifiOff, Trash2, Settings, RefreshCw, Radio, Download } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface PrinterItem {
  id: string
  name: string
  model: string
  status: string
  paperLevel: number
  inkLevel: number
  paperSize: string[]
  colorCapable: boolean
  duplexCapable: boolean
}

export default function ShopPrintersPage() {
  const [printers, setPrinters] = useState<PrinterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showLevelsDialog, setShowLevelsDialog] = useState<string | null>(null)
  const [paperLevel, setPaperLevel] = useState("100")
  const [inkLevel, setInkLevel] = useState("100")
  const [systemPrinters, setSystemPrinters] = useState<{ name: string; model: string; status: string }[]>([])
  const [scanning, setScanning] = useState(false)
  const [ippUri, setIppUri] = useState("")
  const [addMode, setAddMode] = useState<"manual" | "discover">("manual")
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    const data = await getPrintersAction()
    setPrinters(data as unknown as PrinterItem[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleToggleStatus = async (printerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ONLINE" ? "OFFLINE" : "ONLINE"
    const result = await updatePrinterStatusAction(printerId, newStatus)
    if (result.success) {
      toast.success(`Printer ${newStatus === "ONLINE" ? "online" : "offline"}`)
      fetchData()
    } else {
      toast.error(result.error || "Failed to update status")
    }
  }

  const handleUpdateLevels = async (printerId: string) => {
    const result = await updatePrinterLevelsAction(printerId, parseInt(paperLevel), parseInt(inkLevel))
    if (result.success) {
      toast.success("Levels updated")
      setShowLevelsDialog(null)
      fetchData()
    } else {
      toast.error(result.error || "Failed to update levels")
    }
  }

  const handleRemove = async (printerId: string) => {
    if (!confirm("Are you sure you want to remove this printer?")) return
    const result = await removePrinterAction(printerId)
    if (result.success) {
      toast.success("Printer removed")
      fetchData()
    } else {
      toast.error(result.error || "Failed to remove printer")
    }
  }

  const handleScanPrinters = async () => {
    setScanning(true)
    try {
      const res = await fetch("/api/print?action=discover")
      const data = await res.json()
      if (data.printers) {
        setSystemPrinters(data.printers)
        setAddMode("discover")
        if (data.printers.length === 0) {
          toast.info("No printers found on this system. Try adding via IPP.")
        } else {
          toast.success(`Found ${data.printers.length} printer(s)`)
        }
      }
    } catch {
      toast.error("Failed to scan for printers")
    }
    setScanning(false)
  }

  const handleImportSystemPrinter = async (printer: { name: string; model: string }) => {
    if (submitting) return
    setSubmitting(true)
    const formData = new FormData()
    formData.set("name", printer.name)
    formData.set("model", printer.model || "Unknown")
    formData.set("paperSizes", JSON.stringify(["A4", "Letter"]))
    formData.set("colorCapable", "true")
    formData.set("duplexCapable", "true")
    const result = await addPrinterAction(null, formData)
    if (result.success) {
      toast.success(`Imported "${printer.name}"`)
      setShowAddDialog(false)
      fetchData()
    } else {
      toast.error(result.error || "Failed to import printer")
    }
    setSubmitting(false)
  }

  const handleAddIppPrinter = async () => {
    if (submitting) return
    if (!ippUri.trim()) {
      toast.error("Enter a printer URI (e.g. ipp://192.168.1.100/ipp/print)")
      return
    }
    setSubmitting(true)
    const name = `Network-${Date.now().toString(36).slice(-4)}`
    const formData = new FormData()
    formData.set("name", name)
    formData.set("model", "Network Printer")
    formData.set("paperSizes", JSON.stringify(["A4", "Letter"]))
    formData.set("colorCapable", "true")
    formData.set("duplexCapable", "true")
    const result = await addPrinterAction(null, formData)
    if (result.success) {
      toast.success("Network printer added")
      setIppUri("")
      setShowAddDialog(false)
      fetchData()
    } else {
      toast.error(result.error || "Failed to add printer")
    }
    setSubmitting(false)
  }

  const filtered = printers.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar title="Printers" type="shop" />
        <div className="flex">
          <Sidebar type="shop" />
          <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded w-full max-w-64" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Printers" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
          >
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search printers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Add Printer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Printer</DialogTitle>
                </DialogHeader>
                <Tabs value={addMode} onValueChange={(v) => setAddMode(v as "manual" | "discover")}>
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
                    <TabsTrigger value="discover">Scan System</TabsTrigger>
                    <TabsTrigger value="manual">Manual / IPP</TabsTrigger>
                  </TabsList>

                  <TabsContent value="discover" className="space-y-4 mt-4">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleScanPrinters}
                      disabled={scanning}
                    >
                      {scanning ? (
                        <><RefreshCw className="h-4 w-4 animate-spin" /> Scanning...</>
                      ) : (
                        <><Radio className="h-4 w-4" /> Discover CUPS Printers</>
                      )}
                    </Button>

                    {systemPrinters.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {systemPrinters.map((sp) => (
                          <div
                            key={sp.name}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div>
                              <p className="font-medium text-sm">{sp.name}</p>
                              <p className="text-xs text-muted-foreground">{sp.model}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={sp.status.toLowerCase()} />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1"
                                disabled={submitting}
                                onClick={() => handleImportSystemPrinter(sp)}
                              >
                                <Download className="h-3 w-3" /> Import
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium">IPP URI (optional)</label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={ippUri}
                          onChange={(e) => setIppUri(e.target.value)}
                          placeholder="ipp://192.168.1.100/ipp/print"
                        />
                        <Button variant="outline" size="sm" disabled={submitting} onClick={handleAddIppPrinter}>
                          Add
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty and use the form below for manual entry
                      </p>
                    </div>
                    <div className="border-t pt-4">
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault()
                          if (submitting) return
                          setSubmitting(true)
                          const form = e.currentTarget
                          const formData = new FormData(form)
                          const paperSizes: string[] = []
                          form.querySelectorAll<HTMLInputElement>('input[name="paperSize"]:checked').forEach((el) => paperSizes.push(el.value))
                          formData.set("paperSizes", JSON.stringify(paperSizes))
                          const result = await addPrinterAction(null, formData)
                          if (result.success) {
                            toast.success("Printer added")
                            setShowAddDialog(false)
                            fetchData()
                          } else {
                            toast.error(result.error || "Failed to add printer")
                          }
                          setSubmitting(false)
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input name="name" required placeholder="e.g. HP LaserJet Pro M404" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model</label>
                          <Input name="model" required placeholder="e.g. M404dn" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Paper Sizes</label>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {["A4", "A3", "A5", "Letter", "Legal"].map((size) => (
                              <label key={size} className="flex items-center gap-1.5 text-sm">
                                <input type="checkbox" name="paperSize" value={size} defaultChecked={size === "A4"} />
                                {size}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="colorCapable" value="true" defaultChecked />
                            Color Capable
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="duplexCapable" value="true" defaultChecked />
                            Duplex Capable
                          </label>
                        </div>
                        <Button type="submit" className="w-full" disabled={submitting}>Add Printer</Button>
                      </form>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </motion.div>

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 text-muted-foreground"
            >
              <Printer className="mx-auto h-12 w-12 mb-4 opacity-30" />
              <p className="font-medium">No printers found</p>
              <p className="text-sm">Add your first printer to get started</p>
            </motion.div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((printer, index) => (
                <motion.div
                  key={printer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Printer className="h-5 w-5 text-primary" />
                        </div>
                        <StatusBadge status={printer.status.toLowerCase()} />
                      </div>
                      <h3 className="font-semibold">{printer.name}</h3>
                      <p className="text-sm text-muted-foreground">{printer.model}</p>

                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Paper Level</span>
                            <span className={printer.paperLevel < 25 ? "text-red-500 font-medium" : ""}>{printer.paperLevel}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted">
                            <div className={`h-full rounded-full ${
                              printer.paperLevel < 25 ? "bg-red-500" : printer.paperLevel < 50 ? "bg-yellow-500" : "bg-emerald-500"
                            }`} style={{ width: `${printer.paperLevel}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Ink/Toner Level</span>
                            <span className={printer.inkLevel < 25 ? "text-red-500 font-medium" : ""}>{printer.inkLevel}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted">
                            <div className={`h-full rounded-full ${
                              printer.inkLevel < 25 ? "bg-red-500" : printer.inkLevel < 50 ? "bg-yellow-500" : "bg-blue-500"
                            }`} style={{ width: `${printer.inkLevel}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1">
                        {printer.paperSize.map((size) => (
                          <span key={size} className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                            {size}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-2 pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs h-8"
                          onClick={() => handleToggleStatus(printer.id, printer.status)}
                        >
                          {printer.status === "ONLINE" ? (
                            <><WifiOff className="h-3 w-3" /> Go Offline</>
                          ) : (
                            <><Wifi className="h-3 w-3" /> Go Online</>
                          )}
                        </Button>
                        <Dialog open={showLevelsDialog === printer.id} onOpenChange={(open) => {
                          if (open) {
                            setShowLevelsDialog(printer.id)
                            setPaperLevel(String(printer.paperLevel))
                            setInkLevel(String(printer.inkLevel))
                          } else {
                            setShowLevelsDialog(null)
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                              <Settings className="h-3 w-3" /> Levels
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Levels - {printer.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Paper Level (%)</label>
                                <Input type="number" min="0" max="100" value={paperLevel} onChange={(e) => setPaperLevel(e.target.value)} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Ink/Toner Level (%)</label>
                                <Input type="number" min="0" max="100" value={inkLevel} onChange={(e) => setInkLevel(e.target.value)} />
                              </div>
                              <Button className="w-full" onClick={() => handleUpdateLevels(printer.id)}>Save</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs h-8 text-red-500 hover:text-red-600 ml-auto"
                          onClick={() => handleRemove(printer.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
