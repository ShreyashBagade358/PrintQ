"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, Filter, CheckCircle, XCircle, Trash2, Eye } from "lucide-react"

const shops = [
  { id: 1, name: "PrintPro Delhi", owner: "Rajesh Kumar", email: "rajesh@printpro.com", plan: "Professional", status: "active", orders: 1250, revenue: "₹2,45,000" },
  { id: 2, name: "CopyCat Mumbai", owner: "Priya Sharma", email: "priya@copycat.com", plan: "Starter", status: "active", orders: 450, revenue: "₹85,000" },
  { id: 3, name: "Digital Prints", owner: "Amit Patel", email: "amit@digitalprints.com", plan: "Business", status: "pending", orders: 0, revenue: "₹0" },
  { id: 4, name: "QuickPrint Chennai", owner: "Suresh R.", email: "suresh@quickprint.com", plan: "Professional", status: "suspended", orders: 890, revenue: "₹1,75,000" },
]

export default function AdminShopsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search shops..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
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
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>
                      <div>
                        <p>{shop.owner}</p>
                        <p className="text-xs text-muted-foreground">{shop.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{shop.plan}</TableCell>
                    <TableCell>{shop.orders}</TableCell>
                    <TableCell>{shop.revenue}</TableCell>
                    <TableCell><StatusBadge status={shop.status} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {shop.status === "pending" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {shop.status === "active" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
