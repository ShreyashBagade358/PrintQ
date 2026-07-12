"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, Filter, Download, MessageSquare } from "lucide-react"

const tickets = [
  { id: "TKT-001", subject: "Unable to upload PDF files", user: "Rajesh K.", shop: "PrintPro Delhi", priority: "high", status: "open", date: "Jan 15" },
  { id: "TKT-002", subject: "Billing question about upgrade", user: "Priya M.", shop: "CopyCat Mumbai", priority: "normal", status: "in_progress", date: "Jan 14" },
  { id: "TKT-003", subject: "Printer not showing in queue", user: "Amit P.", shop: "Digital Prints", priority: "urgent", status: "open", date: "Jan 14" },
  { id: "TKT-004", subject: "How to export reports?", user: "Suresh R.", shop: "QuickPrint", priority: "low", status: "resolved", date: "Jan 12" },
]

export default function AdminTicketsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Support Tickets" type="admin" />
      <div className="flex">
        <Sidebar type="admin" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
          >
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tickets..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono font-medium">{ticket.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                        <TableCell>{ticket.user}</TableCell>
                        <TableCell>{ticket.shop}</TableCell>
                        <TableCell><StatusBadge status={ticket.priority} /></TableCell>
                        <TableCell><StatusBadge status={ticket.status} /></TableCell>
                        <TableCell className="text-muted-foreground">{ticket.date}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table></div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
