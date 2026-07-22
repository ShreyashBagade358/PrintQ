"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { IndianRupee, TrendingUp, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Revenue", value: "₹48,50,000", change: "+18.5%" },
          { label: "Successful Payments", value: "2,450", change: "+12.3%" },
          { label: "Failed Payments", value: "45", change: "-5.2%" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-2xl font-bold">{stat.value}</p>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3" /> {stat.change}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: "pi_abc123", shop: "PrintPro Delhi", amount: "₹2,499", method: "Visa", date: "Jan 15", status: "paid" },
                { id: "pi_def456", shop: "CopyCat Mumbai", amount: "₹999", method: "UPI", date: "Jan 14", status: "paid" },
                { id: "pi_ghi789", shop: "Digital Prints", amount: "₹49,999", method: "Bank Transfer", date: "Jan 12", status: "paid" },
                { id: "pi_jkl012", shop: "QuickPrint", amount: "₹2,499", method: "Visa", date: "Jan 10", status: "failed" },
              ].map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-xs">{txn.id}</TableCell>
                  <TableCell>{txn.shop}</TableCell>
                  <TableCell>{txn.amount}</TableCell>
                  <TableCell>{txn.method}</TableCell>
                  <TableCell>{txn.date}</TableCell>
                  <TableCell><StatusBadge status={txn.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
