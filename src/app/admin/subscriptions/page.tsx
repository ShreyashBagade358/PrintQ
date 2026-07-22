"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Edit, CreditCard, Plus } from "lucide-react"

const plans = [
  { id: 1, name: "Starter", price: "₹999/mo", yearly: "₹9,999/yr", shops: 156, status: "active" },
  { id: 2, name: "Professional", price: "₹2,499/mo", yearly: "₹24,999/yr", shops: 245, status: "active" },
  { id: 3, name: "Business", price: "₹4,999/mo", yearly: "₹49,999/yr", shops: 85, status: "active" },
]

const transactions = [
  { id: "TXN-001", shop: "PrintPro Delhi", plan: "Professional", amount: "₹2,499", date: "Jan 15, 2025", status: "paid" },
  { id: "TXN-002", shop: "CopyCat Mumbai", plan: "Starter", amount: "₹999", date: "Jan 14, 2025", status: "paid" },
  { id: "TXN-003", shop: "Digital Prints", plan: "Business", amount: "₹49,999", date: "Jan 12, 2025", status: "paid" },
]

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold">Subscription Plans</h2>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Plan
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid gap-6 md:grid-cols-3"
      >
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="text-2xl font-bold mt-2">{plan.price}</p>
              <p className="text-sm text-muted-foreground">{plan.yearly}</p>
              <p className="text-sm mt-2">{plan.shops} shops on this plan</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono font-medium">{txn.id}</TableCell>
                    <TableCell>{txn.shop}</TableCell>
                    <TableCell>{txn.plan}</TableCell>
                    <TableCell>{txn.amount}</TableCell>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell><StatusBadge status={txn.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
