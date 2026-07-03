"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    slug: "starter",
    description: "Perfect for small print shops just getting started.",
    monthlyPrice: 999,
    yearlyPrice: 9999,
    features: [
      "Up to 2 staff members",
      "500 orders/month",
      "2 printers",
      "1 GB storage",
      "Basic analytics",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    slug: "professional",
    description: "Ideal for growing print shops with higher volume.",
    monthlyPrice: 2499,
    yearlyPrice: 24999,
    features: [
      "Up to 10 staff members",
      "2000 orders/month",
      "10 printers",
      "10 GB storage",
      "Advanced analytics",
      "Priority support",
      "Custom pricing rules",
      "API access",
    ],
    highlighted: true,
  },
  {
    name: "Business",
    slug: "business",
    description: "For large print shops with unlimited needs.",
    monthlyPrice: 4999,
    yearlyPrice: 49999,
    features: [
      "Unlimited staff",
      "Unlimited orders",
      "Unlimited printers",
      "Unlimited storage",
      "Enterprise analytics",
      "24/7 phone support",
      "Custom pricing rules",
      "API access",
      "White labeling",
      "Dedicated account manager",
    ],
    highlighted: false,
  },
]

const comparisons = [
  { feature: "Staff Members", starter: "2", professional: "10", business: "Unlimited" },
  { feature: "Monthly Orders", starter: "500", professional: "2000", business: "Unlimited" },
  { feature: "Printers", starter: "2", professional: "10", business: "Unlimited" },
  { feature: "Storage", starter: "1 GB", professional: "10 GB", business: "Unlimited" },
  { feature: "Analytics", starter: "Basic", professional: "Advanced", business: "Enterprise" },
  { feature: "Support", starter: "Email", professional: "Priority", business: "24/7 Phone" },
  { feature: "Custom Pricing", starter: false, professional: true, business: true },
  { feature: "API Access", starter: false, professional: true, business: true },
  { feature: "White Labeling", starter: false, professional: false, business: true },
]

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)

  return (
    <>
      <PublicNavbar />
      <main className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Choose the plan that fits your print shop. No hidden fees. No surprises.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <span className={`text-sm ${!yearly ? "font-semibold" : "text-muted-foreground"}`}>Monthly</span>
              <Switch checked={yearly} onCheckedChange={setYearly} />
              <span className={`text-sm ${yearly ? "font-semibold" : "text-muted-foreground"}`}>
                Yearly
                <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Save 15%
                </span>
              </span>
            </div>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-xl border p-6 ${
                  plan.highlighted
                    ? "border-primary shadow-lg ring-1 ring-primary"
                    : "bg-card shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ₹{yearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{yearly ? "year" : "month"}
                    </span>
                  </div>
                </div>

                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/auth/register">
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full gap-2"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-20"
          >
            <h2 className="mb-8 text-center text-2xl font-bold">Compare Plans</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Feature</th>
                    <th className="py-3 text-center font-medium">Starter</th>
                    <th className="py-3 text-center font-medium text-primary">Professional</th>
                    <th className="py-3 text-center font-medium">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row) => (
                    <tr key={row.feature} className="border-b last:border-0">
                      <td className="py-3 text-left">{row.feature}</td>
                      <td className="py-3 text-center">
                        {typeof row.starter === "boolean" ? (
                          row.starter ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : "—"
                        ) : (
                          row.starter
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {typeof row.professional === "boolean" ? (
                          row.professional ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : "—"
                        ) : (
                          row.professional
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {typeof row.business === "boolean" ? (
                          row.business ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : "—"
                        ) : (
                          row.business
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-20 text-center"
          >
            <h2 className="text-2xl font-bold">Still not sure?</h2>
            <p className="mt-2 text-muted-foreground">
              Talk to our sales team to find the perfect plan for your shop.
            </p>
            <Link href="/public/contact">
              <Button variant="outline" size="lg" className="mt-6">
                Contact Sales
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
