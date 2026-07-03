"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, Plus, Edit, Trash2 } from "lucide-react"

export default function AdminCouponsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Coupon Management" type="admin" />
      <div className="flex">
        <Sidebar type="admin" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Coupons</h2>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Coupon</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { code: "WELCOME10", discount: "10% off", min: "₹100", uses: "45/100", expires: "Feb 28", status: "active" },
                    { code: "FIRSTORDER", discount: "₹50 off", min: "₹200", uses: "120/500", expires: "Mar 15", status: "active" },
                    { code: "SUMMER25", discount: "25% off", min: "₹500", uses: "12/50", expires: "Apr 1", status: "active" },
                    { code: "OLD50", discount: "50% off", min: "₹1000", uses: "500/500", expires: "Jan 1", status: "inactive" },
                  ].map((coupon) => (
                    <TableRow key={coupon.code}>
                      <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                      <TableCell>{coupon.discount}</TableCell>
                      <TableCell>{coupon.min}</TableCell>
                      <TableCell>{coupon.uses}</TableCell>
                      <TableCell>{coupon.expires}</TableCell>
                      <TableCell><StatusBadge status={coupon.status} /></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
