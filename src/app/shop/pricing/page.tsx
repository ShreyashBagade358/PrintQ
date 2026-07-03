"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Plus, Trash2 } from "lucide-react"

const pricingRules = [
  { paperSize: "A4", colorType: "Black & White", pricePerPage: 2, minCopies: 1 },
  { paperSize: "A4", colorType: "Color", pricePerPage: 10, minCopies: 1 },
  { paperSize: "A3", colorType: "Black & White", pricePerPage: 4, minCopies: 1 },
  { paperSize: "A3", colorType: "Color", pricePerPage: 20, minCopies: 1 },
  { paperSize: "A5", colorType: "Black & White", pricePerPage: 1, minCopies: 5 },
  { paperSize: "A5", colorType: "Color", pricePerPage: 5, minCopies: 5 },
]

export default function ShopPricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Pricing Management" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Price Per Page</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paper Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price/Page (₹)</TableHead>
                      <TableHead>Min Copies</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingRules.map((rule, index) => (
                      <TableRow key={index}>
                        <TableCell>{rule.paperSize}</TableCell>
                        <TableCell>{rule.colorType}</TableCell>
                        <TableCell>₹{rule.pricePerPage}</TableCell>
                        <TableCell>{rule.minCopies}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 rounded-lg border p-4">
                  <h4 className="font-medium mb-4">Add Pricing Rule</h4>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Paper Size</label>
                      <Select defaultValue="A4">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="A3">A3</SelectItem>
                          <SelectItem value="A5">A5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Type</label>
                      <Select defaultValue="black_white">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="black_white">Black &amp; White</SelectItem>
                          <SelectItem value="color">Color</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input label="Price per Page (₹)" type="number" placeholder="2" />
                    <Input label="Min Copies" type="number" placeholder="1" />
                  </div>
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" /> Add Rule
                  </Button>
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">Finishing Charges</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Stapling (₹)" type="number" defaultValue={5} />
                    <Input label="Spiral Binding (₹)" type="number" defaultValue={50} />
                    <Input label="Hardcover Binding (₹)" type="number" defaultValue={150} />
                    <Input label="Lamination (₹)" type="number" defaultValue={20} />
                  </div>
                </div>

                <Button className="mt-6 gap-2">
                  <Save className="h-4 w-4" /> Save All Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
