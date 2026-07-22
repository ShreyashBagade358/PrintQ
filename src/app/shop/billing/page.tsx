"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Receipt, Download, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ShopBillingPage() {
  return (
    <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">Professional</h3>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">₹2,499/month • Next billing on Feb 15, 2025</p>
                    <ul className="mt-4 space-y-2">
                      {["Up to 10 staff members", "2000 orders/month", "10 printers", "10 GB storage"].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href="/shop/subscription">
                    <Button variant="outline" className="gap-2">
                      Upgrade <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/26</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Change Payment Method
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice History</CardTitle>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Export All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: "INV-2025-001", date: "Jan 15, 2025", amount: "₹2,499", status: "paid" },
                    { id: "INV-2025-002", date: "Dec 15, 2024", amount: "₹2,499", status: "paid" },
                    { id: "INV-2025-003", date: "Nov 15, 2024", amount: "₹2,499", status: "paid" },
                  ].map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{inv.id}</p>
                          <p className="text-sm text-muted-foreground">{inv.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{inv.amount}</span>
                        <Badge variant="success">{inv.status}</Badge>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
    </div>
  )
}
