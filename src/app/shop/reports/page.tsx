"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Download, FileText } from "lucide-react"

export default function ShopReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Reports" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Monthly Sales Report", type: "PDF", date: "Jan 2025" },
              { title: "Order Summary", type: "CSV", date: "Last 30 days" },
              { title: "Customer Report", type: "PDF", date: "Q4 2024" },
            ].map((report, i) => (
              <motion.div
                key={report.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-medium">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">{report.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Generate Custom Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Report Type</label>
                    <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option>Orders</option>
                      <option>Revenue</option>
                      <option>Customers</option>
                      <option>Printers</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Date Range</label>
                    <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last quarter</option>
                      <option>Custom range</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Format</label>
                    <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option>PDF</option>
                      <option>CSV</option>
                      <option>Excel</option>
                    </select>
                  </div>
                </div>
                <Button className="mt-4 gap-2">
                  <Download className="h-4 w-4" /> Generate Report
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
