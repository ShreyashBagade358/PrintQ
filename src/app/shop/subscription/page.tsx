"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "₹999/mo",
    yearly: "₹9,999/yr",
    features: ["2 staff members", "500 orders/month", "2 printers", "1 GB storage", "Basic analytics"],
    current: false,
  },
  {
    name: "Professional",
    price: "₹2,499/mo",
    yearly: "₹24,999/yr",
    features: ["10 staff members", "2000 orders/month", "10 printers", "10 GB storage", "Advanced analytics", "Priority support"],
    current: true,
  },
  {
    name: "Business",
    price: "₹4,999/mo",
    yearly: "₹49,999/yr",
    features: ["Unlimited staff", "Unlimited orders", "Unlimited printers", "Unlimited storage", "Enterprise analytics", "24/7 support", "White labeling"],
    current: false,
  },
]

export default function ShopSubscriptionPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Subscription" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/shop/billing" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4">
              <ArrowLeft className="h-3 w-3" /> Back to Billing
            </Link>
            <h2 className="text-2xl font-bold">Choose a Plan</h2>
            <p className="text-muted-foreground">Upgrade or downgrade your subscription anytime.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative ${plan.current ? "border-primary ring-1 ring-primary" : ""}`}>
                  {plan.current && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Current Plan
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-3">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground ml-1">/mo</span>
                      <p className="text-xs text-muted-foreground mt-1">or {plan.yearly} (save 15%)</p>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-6"
                      variant={plan.current ? "outline" : "default"}
                      disabled={plan.current}
                    >
                      {plan.current ? "Current Plan" : `Switch to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
