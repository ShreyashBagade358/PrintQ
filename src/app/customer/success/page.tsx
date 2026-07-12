"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Share2, Upload, Printer } from "lucide-react"
import Link from "next/link"

export default function UploadSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Order Submitted" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64">
          <div className="mx-auto max-w-lg py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold">Order Submitted!</h1>
              <p className="mt-2 text-muted-foreground">
                Your print job has been received. We&apos;ll notify you when it&apos;s ready.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mt-8">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Order ID</span>
                    <span className="font-mono font-medium">ORD-A1B2C3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated Ready</span>
                    <span className="font-medium">Today, 3:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pages</span>
                    <span>10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Copies</span>
                    <span>1</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-xl font-bold text-primary">₹20.00</span>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 space-y-3">
                <Link href="/customer/track">
                  <Button className="w-full gap-2" size="lg">
                    Track Order <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/customer/upload">
                  <Button variant="outline" className="w-full gap-2" size="lg">
                    <Upload className="h-4 w-4" /> Upload Another
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full gap-2">
                  <Share2 className="h-4 w-4" /> Share Order Link
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
