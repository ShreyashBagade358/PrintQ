"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, Filter, Play, CheckCircle, PrinterIcon, ArrowUpDown } from "lucide-react"
import { getQueueAction, startPrintJobAction, completePrintJobAction, assignPrinterToJobAction, updateQueuePriorityAction } from "@/lib/actions/queue.actions"
import { getPrintersAction } from "@/lib/actions/printer.actions"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface QueueItem {
  id: string
  position: number
  priority: string
  status: string
  startedAt: string | null
  completedAt: string | null
  orderId: string
  order: {
    id: string
    orderId: string
    pages: number
    color: string
    copies: number
    customer: { name: string } | null
  } | null
  printer: { id: string; name: string } | null
  printerId: string | null
  assignedTo: string | null
}

interface Printer {
  id: string
  name: string
  status: string
}

export default function ShopQueuePage() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchData = useCallback(async () => {
    const [queue, printersData] = await Promise.all([
      getQueueAction(),
      getPrintersAction(),
    ])
    setQueueItems(queue as QueueItem[])
    setPrinters(printersData as Printer[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleStartPrint = async (itemId: string, printerId: string) => {
    if (!printerId) {
      toast.error("Select a printer first")
      return
    }
    const result = await startPrintJobAction(itemId, printerId)
    if (result.success) {
      toast.success("Print job started")
      fetchData()
    } else {
      toast.error(result.error || "Failed to start print")
    }
  }

  const handleCompletePrint = async (itemId: string) => {
    const result = await completePrintJobAction(itemId)
    if (result.success) {
      toast.success("Job marked as complete")
      fetchData()
    } else {
      toast.error(result.error || "Failed to complete")
    }
  }

  const handleAssignPrinter = async (itemId: string, printerId: string) => {
    const result = await assignPrinterToJobAction(itemId, printerId)
    if (result.success) {
      toast.success("Printer assigned")
      fetchData()
    } else {
      toast.error(result.error || "Failed to assign printer")
    }
  }

  const handlePriorityChange = async (itemId: string, priority: string) => {
    const result = await updateQueuePriorityAction(itemId, priority)
    if (result.success) {
      toast.success("Priority updated")
      fetchData()
    } else {
      toast.error(result.error || "Failed to update priority")
    }
  }

  const filtered = queueItems.filter(
    (item) =>
      item.order?.orderId.toLowerCase().includes(search.toLowerCase()) ||
      item.order?.customer?.name.toLowerCase().includes(search.toLowerCase()),
  )

  const availablePrinters = printers.filter((p) => p.status === "ONLINE")

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar title="Active Queue" type="shop" />
        <div className="flex">
          <Sidebar type="shop" />
          <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded w-64" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Active Queue" type="shop" />
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
              <Input
                placeholder="Search queue..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchData}>
                Refresh
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Print Queue ({filtered.length} items)</CardTitle>
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <PrinterIcon className="mx-auto h-12 w-12 mb-4 opacity-30" />
                    <p className="font-medium">Queue is empty</p>
                    <p className="text-sm">New orders will appear here when received</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Pages</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Copies</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Priority <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Printer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.position}</TableCell>
                          <TableCell className="font-mono font-medium">
                            {item.order?.orderId}
                          </TableCell>
                          <TableCell>{item.order?.customer?.name || "—"}</TableCell>
                          <TableCell>{item.order?.pages || "—"}</TableCell>
                          <TableCell>{item.order?.color || "—"}</TableCell>
                          <TableCell>{item.order?.copies || "—"}</TableCell>
                          <TableCell>
                            <Select
                              value={item.priority}
                              onValueChange={(v) => handlePriorityChange(item.id, v)}
                            >
                              <SelectTrigger className="h-7 w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="NORMAL">Normal</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {item.status === "QUEUED" ? (
                              <Select
                                value={item.printerId || ""}
                                onValueChange={(v) => handleAssignPrinter(item.id, v)}
                              >
                                <SelectTrigger className="h-7 w-32">
                                  <SelectValue placeholder="Assign..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {availablePrinters.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {item.printer?.name || "—"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell><StatusBadge status={item.status} /></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {item.status === "QUEUED" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleStartPrint(item.id, item.printerId || "")}
                                  disabled={!item.printerId}
                                  title="Start printing"
                                >
                                  <Play className="h-4 w-4 text-emerald-600" />
                                </Button>
                              )}
                              {item.status === "PRINTING" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleCompletePrint(item.id)}
                                  title="Mark as complete"
                                >
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
