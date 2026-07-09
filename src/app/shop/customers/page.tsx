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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, Plus, Loader2, ChevronRight } from "lucide-react"
import { getCustomersAction, createCustomerAction } from "@/lib/actions/shop.actions"
import { toast } from "sonner"

export default function ShopCustomersPage() {
  const [customers, setCustomers] = useState<Awaited<ReturnType<typeof getCustomersAction>>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addName, setAddName] = useState("")
  const [addEmail, setAddEmail] = useState("")
  const [addPhone, setAddPhone] = useState("")

  const fetch = useCallback(async (q?: string) => {
    setLoading(true)
    const data = await getCustomersAction(q)
    setCustomers(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    const timer = setTimeout(() => fetch(search || undefined), 300)
    return () => clearTimeout(timer)
  }, [search, fetch])

  const handleAdd = async () => {
    if (!addName || !addEmail) { toast.error("Name and email are required"); return }
    setAdding(true)
    const form = new FormData()
    form.set("name", addName)
    form.set("email", addEmail)
    form.set("phone", addPhone)
    const result = await createCustomerAction(null, form)
    setAdding(false)
    if (result.success) {
      toast.success("Customer added")
      setShowAdd(false)
      setAddName(""); setAddEmail(""); setAddPhone("")
      fetch(search || undefined)
    } else {
      toast.error(result.error || "Failed to add customer")
    }
  }

  const formatSpent = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Customers" type="shop" />
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
              <Input placeholder="Search customers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button className="gap-2" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>All Customers</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : customers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">No customers found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{customer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{customer.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.totalOrders}</TableCell>
                          <TableCell>{formatSpent(customer.totalSpent)}</TableCell>
                          <TableCell><StatusBadge status={customer.totalOrders > 0 ? "active" : "inactive"} /></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
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

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>Add a new customer to your shop.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input label="Full Name" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="John Doe" />
            <Input label="Email" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="john@example.com" />
            <Input label="Phone (optional)" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} loading={adding}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
