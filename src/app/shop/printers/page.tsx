"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPrintersAction, addPrinterAction, updatePrinterStatusAction, updatePrinterLevelsAction, removePrinterAction } from "@/lib/actions/printer.actions"
import { getPrintServersAction, registerPrintServerAction, deletePrintServerAction, discoverBridgePrintersAction } from "@/lib/actions/print-server.actions"
import { Plus, Printer, Search, Wifi, WifiOff, Trash2, Settings, RefreshCw, Radio, Download, Server, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface PrintServerItem {
  id: string
  name: string
  status: string
  lastSeen: string | null
  ipAddress: string | null
  createdAt: string
}

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

  const [printServers, setPrintServers] = useState<PrintServerItem[]>([])
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [newServerName, setNewServerName] = useState("")
  const [registeredToken, setRegisteredToken] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)

  const fetchPrintServers = useCallback(async () => {
    const servers = await getPrintServersAction()
    setPrintServers(servers as unknown as PrintServerItem[])
  }, [])

  const fetchData = useCallback(async () => {
    const data = await getPrintersAction()
    setPrinters(data as unknown as PrinterItem[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchPrintServers() }, [fetchPrintServers])

  const handleRegisterServer = async () => {
    if (!newServerName.trim()) {
      toast.error("Enter a server name")
      return
    }
    setRegistering(true)
    const result = await registerPrintServerAction(newServerName.trim())
    if ("error" in result) {
      toast.error(result.error || "Failed to register")
      setRegistering(false)
      return
    }
    setRegisteredToken(result.token)
    setNewServerName("")
    fetchPrintServers()
    toast.success("Server registered. Copy the token below.")
    setRegistering(false)
  }

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm("Delete this print server? It will need to re-register.")) return
    const result = await deletePrintServerAction(serverId)
    if ("error" in result) {
      toast.error(result.error || "Failed to delete")
      return
    }
    toast.success("Print server deleted")
    fetchPrintServers()
  }

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "Never"
    const diff = Date.now() - new Date(lastSeen).getTime()
    if (diff < 60_000) return "Just now"
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
    return `${Math.floor(diff / 86_400_000)}d ago`
  }

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
      const result = await discoverBridgePrintersAction()
      if ("error" in result) {
        toast.error(result.error || "Failed to scan for printers")
        return
      }
      const printers = result.printers
      setSystemPrinters(printers)
      setAddMode("discover")
      if (printers.length === 0) {
        toast.info("No printers found on this system. Try adding via IPP.")
      } else {
        toast.success(`Found ${printers.length} printer(s)`)
      }
    } catch {
      toast.error("Failed to scan for printers")
    } finally {
      setScanning(false)
    }
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
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-muted rounded w-full max-w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Print Server</CardTitle>
                {printServers.length > 0 && (
                  <span className={`ml-2 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${printServers.some((s) => s.status === "ONLINE") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${printServers.some((s) => s.status === "ONLINE") ? "bg-emerald-500" : "bg-red-500"}`} />
                    {printServers.some((s) => s.status === "ONLINE") ? "Connected" : "Offline"}
                  </span>
                )}
              </div>
              <Dialog open={showRegisterDialog} onOpenChange={(open) => {
                setShowRegisterDialog(open)
                if (!open) setRegisteredToken(null)
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Register Server
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register Print Server</DialogTitle>
                  </DialogHeader>
                  {registeredToken ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Copy this token and set it as <code className="bg-muted px-1.5 py-0.5 rounded text-xs">PRINTQ_TOKEN</code> when running the print server.
                      </p>
                      <div className="flex items-center gap-2">
                        <Input readOnly value={registeredToken} className="font-mono text-xs" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { navigator.clipboard.writeText(registeredToken); toast.success("Copied") }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="bg-muted rounded-lg p-3 font-mono text-xs space-y-1">
                        <p className="text-muted-foreground"># Run on the computer connected to your printers:</p>
                        <p>PRINTQ_URL={typeof window !== "undefined" ? window.location.origin : "https://your-app.vercel.app"} \</p>
                        <p>PRINTQ_TOKEN={registeredToken.slice(0, 12)}... \</p>
                        <p>{"PRINTQ_NAME=\"" + (newServerName || "My Printer") + "\" \\"}</p>
                        <p>node print-server.js</p>
                      </div>
                      <Button className="w-full" onClick={() => { setShowRegisterDialog(false); setRegisteredToken(null) }}>Done</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Register a print server that runs on the computer connected to your printers.
                      </p>
                      <Input
                        placeholder="Server name (e.g. Front Desk PC)"
                        value={newServerName}
                        onChange={(e) => setNewServerName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleRegisterServer() }}
                      />
                      <Button className="w-full" onClick={handleRegisterServer} disabled={registering}>
                        {registering ? "Registering..." : "Register"}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {printServers.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No print servers registered. Print jobs need a print server to reach your printers.
                  </p>
                  <div className="bg-muted rounded-lg p-3 font-mono text-xs space-y-1">
                    <p className="text-muted-foreground"># 1. Register a server (click above), then run:</p>
                    <p>PRINTQ_URL=... PRINTQ_TOKEN=psk_... node print-server.js</p>
                    <p className="text-muted-foreground mt-2"># The script auto-discovers CUPS printers and handles print jobs.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {printServers.map((server) => (
                    <div key={server.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${server.status === "ONLINE" ? "bg-emerald-500" : "bg-red-500"}`} />
                        <div>
                          <p className="font-medium text-sm">{server.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Last seen: {formatLastSeen(server.lastSeen)}
                            {server.ipAddress && <span className="ml-2">{server.ipAddress}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={server.status.toLowerCase()} />
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleDeleteServer(server.id)}>
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
                        <><Radio className="h-4 w-4" /> Discover Printers</>
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
                          <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                          <Input name="name" required placeholder="e.g. HP LaserJet Pro M404" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model <span className="text-red-500">*</span></label>
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
      </div>
  )
}
