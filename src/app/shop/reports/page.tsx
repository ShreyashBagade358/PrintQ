"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  Download, FileText, Loader2, BarChart3, IndianRupee, ShoppingCart, Users, Printer,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
  getMonthlySalesReportAction,
  getOrderSummaryAction,
  getCustomerReportAction,
  getCustomReportDataAction,
} from "@/lib/actions/report.actions"

type ReportTab = "monthly" | "orders" | "customers" | "custom"

interface MonthlyReport {
  summary: { totalOrders: number; totalRevenue: number; avgOrderValue: number; totalPages: number; colorOrders: number; completedOrders: number }
  orders: Array<{ id: string; customer: string; pages: number; amount: number; status: string; date: string }>
}

interface OrderSummary {
  summary: { totalOrders: number; totalRevenue: number; totalPages: number; statusBreakdown: Record<string, number> }
  daily: Array<{ date: string; orders: number; revenue: number }>
  orders: Array<{ id: string; customer: string; pages: number; amount: number; status: string; date: string }>
}

interface CustomerReport {
  totalCustomers: number
  topCustomers: Array<{ name: string; email: string; phone: string; totalOrders: number; totalSpent: number }>
  allCustomers: Array<{ name: string; email: string; orders: number; spent: number }>
}

interface CustomReport {
  type: string
  dateRange: string
  generatedAt: string
  data: Record<string, string>[]
  summary: Record<string, number | string>
}

function downloadCSV(rows: Record<string, string>[], filename: string) {
  const headers = Object.keys(rows[0] || {})
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${(r[h] || "").replace(/"/g, '""')}"`).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function openPrintView(title: string, rows: Record<string, string>[], summary: Record<string, number | string>) {
  const w = window.open("", "_blank")
  if (!w) return
  const headers = Object.keys(rows[0] || {})
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 40px; color: #1a1a2e; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { background: #f1f5f9; text-align: left; padding: 10px 12px; border-bottom: 2px solid #e2e8f0; font-weight: 600; }
      td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
      tr:hover td { background: #f8fafc; }
      .summary { display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
      .stat { background: #f8fafc; border-radius: 8px; padding: 16px 24px; border: 1px solid #e2e8f0; }
      .stat-label { font-size: 12px; color: #666; }
      .stat-value { font-size: 20px; font-weight: 700; margin-top: 2px; }
      .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    </style></head><body>
    <h1>${title}</h1>
    <p class="meta">Generated on ${new Date().toLocaleString()}</p>
    <div class="summary">${Object.entries(summary).map(([k, v]) => `<div class="stat"><div class="stat-label">${k.replace(/([A-Z])/g, " $1").trim()}</div><div class="stat-value">${typeof v === "number" && k.toLowerCase().includes("revenue") ? "₹" + Number(v).toLocaleString("en-IN") : v}</div></div>`).join("")}</div>
    <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${headers.map((h) => `<td>${r[h] || ""}</td>`).join("")}</tr>`).join("")}</tbody></table>
    <div class="footer">PrintQ Report &mdash; Confidential</div>
    <script>window.print()</script>
    </body></html>`)
  w.document.close()
}

function StatusCell({ status }: { status: string }) {
  return <StatusBadge status={status.toLowerCase()} />
}

export default function ShopReportsPage() {
  const [tab, setTab] = useState<ReportTab>("monthly")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [monthly, setMonthly] = useState<MonthlyReport | null>(null)
  const [orders, setOrders] = useState<OrderSummary | null>(null)
  const [customers, setCustomers] = useState<CustomerReport | null>(null)
  const [custom, setCustom] = useState<CustomReport | null>(null)

  const [reportType, setReportType] = useState("Orders")
  const [dateRange, setDateRange] = useState("Last 7 days")
  const [reportFormat, setReportFormat] = useState("PDF")

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const fetchMonthly = useCallback(async () => {
    setLoading(true)
    const data = await getMonthlySalesReportAction(currentMonth, currentYear)
    if (data) setMonthly(data as unknown as MonthlyReport)
    setLoading(false)
  }, [currentMonth, currentYear])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const data = await getOrderSummaryAction(30)
    if (data) setOrders(data as unknown as OrderSummary)
    setLoading(false)
  }, [])

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const data = await getCustomerReportAction()
    if (data) setCustomers(data as unknown as CustomerReport)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (tab === "monthly") fetchMonthly()
    else if (tab === "orders") fetchOrders()
    else if (tab === "customers") fetchCustomers()
  }, [tab, fetchMonthly, fetchOrders, fetchCustomers])

  const handleGenerate = async () => {
    setGenerating(true)
    const data = await getCustomReportDataAction(reportType, dateRange)
    if (data) {
      setCustom(data as unknown as CustomReport)
      if (reportFormat === "CSV") {
        downloadCSV(data.data as Record<string, string>[], `${reportType.replace(/\s+/g, "_")}_${dateRange.replace(/\s+/g, "_")}.csv`)
      } else {
        setTab("custom")
      }
    }
    setGenerating(false)
  }

  const handleDownload = (format: string, rows: Record<string, string>[], summary: Record<string, number | string>, title: string) => {
    if (format === "CSV") {
      downloadCSV(rows, `${title.replace(/\s+/g, "_")}.csv`)
    } else {
      openPrintView(title, rows, summary)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Reports" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          <div className="flex flex-wrap gap-2 border-b pb-4">
            {([{ k: "monthly", l: "Monthly Sales" }, { k: "orders", l: "Order Summary" }, { k: "customers", l: "Customers" }, { k: "custom", l: "Custom Report" }] as const).map(({ k, l }) => (
              <Button key={k} variant={tab === k ? "default" : "outline"} size="sm" onClick={() => setTab(k)}>{l}</Button>
            ))}
          </div>

          {tab === "monthly" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Monthly Sales Report — {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][currentMonth - 1]} {currentYear}</h2>
                <Button variant="outline" size="sm" className="gap-2" disabled={!monthly} onClick={() => monthly && handleDownload("PDF", monthly.orders.map((o) => ({ "Order ID": o.id, "Customer": o.customer, "Pages": String(o.pages), "Amount": `₹${o.amount.toFixed(2)}`, "Status": o.status, "Date": new Date(o.date).toLocaleDateString() })), { "Total Orders": monthly.summary.totalOrders, "Total Revenue": monthly.summary.totalRevenue, "Avg Order Value": `₹${monthly.summary.avgOrderValue.toFixed(2)}`, "Total Pages": monthly.summary.totalPages, "Completed": monthly.summary.completedOrders }, `Monthly_Sales_${currentMonth}_${currentYear}`)}>
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : monthly ? (
                <>
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                    <Card><CardContent className="p-4 text-center"><BarChart3 className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{monthly.summary.totalOrders}</p><p className="text-xs text-muted-foreground">Total Orders</p></CardContent></Card>
                    <Card><CardContent className="p-4 text-center"><IndianRupee className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{formatCurrency(monthly.summary.totalRevenue)}</p><p className="text-xs text-muted-foreground">Revenue</p></CardContent></Card>
                    <Card><CardContent className="p-4 text-center"><ShoppingCart className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{formatCurrency(monthly.summary.avgOrderValue)}</p><p className="text-xs text-muted-foreground">Avg Order</p></CardContent></Card>
                    <Card><CardContent className="p-4 text-center"><FileText className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{monthly.summary.totalPages}</p><p className="text-xs text-muted-foreground">Pages</p></CardContent></Card>
                    <Card><CardContent className="p-4 text-center"><ShoppingCart className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{monthly.summary.completedOrders}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
                  </div>

                  <Card>
                    <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow><TableHead>Order ID</TableHead><TableHead>Customer</TableHead><TableHead>Pages</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow>
                          </TableHeader>
                          <TableBody>
                            {monthly.orders.map((o) => (
                              <TableRow key={o.id}>
                                <TableCell className="font-mono">{o.id}</TableCell>
                                <TableCell>{o.customer}</TableCell>
                                <TableCell>{o.pages}</TableCell>
                                <TableCell>{formatCurrency(o.amount)}</TableCell>
                                <TableCell><StatusCell status={o.status} /></TableCell>
                                <TableCell>{new Date(o.date).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-16 text-muted-foreground"><p>No data available</p></div>
              )}
            </motion.div>
          )}

          {tab === "orders" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Order Summary — Last 30 Days</h2>
                <Button variant="outline" size="sm" className="gap-2" disabled={!orders} onClick={() => orders && handleDownload("CSV", orders.orders.map((o) => ({ "Order ID": o.id, "Customer": o.customer, "Pages": String(o.pages), "Amount": `₹${o.amount.toFixed(2)}`, "Status": o.status, "Date": new Date(o.date).toLocaleDateString() })), { "Total Orders": orders.summary.totalOrders, "Total Revenue": orders.summary.totalRevenue, "Total Pages": orders.summary.totalPages }, "Order_Summary_30d")}>
                  <Download className="h-4 w-4" /> CSV
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : orders ? (
                <>
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                    <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{orders.summary.totalOrders}</p><p className="text-xs text-muted-foreground">Total Orders</p></CardContent></Card>
                    <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{formatCurrency(orders.summary.totalRevenue)}</p><p className="text-xs text-muted-foreground">Revenue</p></CardContent></Card>
                    <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{orders.summary.totalPages}</p><p className="text-xs text-muted-foreground">Pages Printed</p></CardContent></Card>
                    <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{Object.keys(orders.summary.statusBreakdown).length}</p><p className="text-xs text-muted-foreground">Status Types</p></CardContent></Card>
                  </div>

                  <Card>
                    <CardHeader><CardTitle>Daily Breakdown</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow><TableHead>Date</TableHead><TableHead>Orders</TableHead><TableHead>Revenue</TableHead></TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.daily.map((d) => (
                              <TableRow key={d.date}>
                                <TableCell>{new Date(d.date).toLocaleDateString()}</TableCell>
                                <TableCell>{d.orders}</TableCell>
                                <TableCell>{formatCurrency(d.revenue)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Status Breakdown</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(orders.summary.statusBreakdown).map(([status, count]) => (
                          <div key={status} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                            <StatusBadge status={status.toLowerCase()} />
                            <span className="font-bold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-16 text-muted-foreground"><p>No data available</p></div>
              )}
            </motion.div>
          )}

          {tab === "customers" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Customer Report</h2>
                <Button variant="outline" size="sm" className="gap-2" disabled={!customers} onClick={() => customers && handleDownload("CSV", customers.allCustomers.map((c) => ({ "Name": c.name, "Email": c.email, "Orders": String(c.orders), "Total Spent": `₹${c.spent.toFixed(2)}` })), { "Total Customers": customers.totalCustomers }, "Customer_Report")}>
                  <Download className="h-4 w-4" /> CSV
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : customers ? (
                <>
                  <Card>
                    <CardHeader><CardTitle>Top 10 Customers</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow><TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Orders</TableHead><TableHead>Total Spent</TableHead></TableRow>
                          </TableHeader>
                          <TableBody>
                            {customers.topCustomers.map((c, i) => (
                              <TableRow key={c.email}>
                                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                <TableCell className="font-medium">{c.name}</TableCell>
                                <TableCell>{c.email}</TableCell>
                                <TableCell>{c.phone || "-"}</TableCell>
                                <TableCell>{c.totalOrders}</TableCell>
                                <TableCell>{formatCurrency(c.totalSpent)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
                      <p className="text-3xl font-bold">{customers.totalCustomers}</p>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-16 text-muted-foreground"><p>No data available</p></div>
              )}
            </motion.div>
          )}

          {tab === "custom" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Generate Custom Report</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Report Type</label>
                      <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                        <option>Orders</option>
                        <option>Revenue</option>
                        <option>Customers</option>
                        <option>Printers</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Date Range</label>
                      <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last quarter</option>
                        <option>Custom range</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Format</label>
                      <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={reportFormat} onChange={(e) => setReportFormat(e.target.value)}>
                        <option>PDF</option>
                        <option>CSV</option>
                        <option>Excel</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full gap-2" disabled={generating} onClick={handleGenerate}>
                        {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Download className="h-4 w-4" /> Generate Report</>}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">PDF opens in a print preview window. CSV/Excel downloads a file.</p>
                </CardContent>
              </Card>

              {custom && (
                <>
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                    {Object.entries(custom.summary).map(([k, v]) => (
                      <Card key={k}><CardContent className="p-4 text-center"><p className="text-lg font-bold">{typeof v === "number" && k.toLowerCase().includes("revenue") ? formatCurrency(v) : v}</p><p className="text-xs text-muted-foreground">{k.replace(/([A-Z])/g, " $1").trim()}</p></CardContent></Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>{custom.type} Report — {custom.dateRange}</CardTitle>
                      <p className="text-xs text-muted-foreground">Generated {new Date(custom.generatedAt).toLocaleString()}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(custom.data[0] || {}).map((h) => (<TableHead key={h}>{h}</TableHead>))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {custom.data.map((row, i) => (
                              <TableRow key={i}>
                                {Object.values(row).map((v, j) => (
                                  <TableCell key={j}>{v}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(custom.data, `${custom.type.replace(/\s+/g, "_")}.csv`)}>
                      <Download className="h-4 w-4" /> Download CSV
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openPrintView(`${custom.type} Report`, custom.data, custom.summary)}>
                      <FileText className="h-4 w-4" /> Print / PDF
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
