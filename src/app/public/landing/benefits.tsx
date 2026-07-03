"use client"

import { motion } from "framer-motion"
import { Clock, PhoneOff, Zap, TrendingUp } from "lucide-react"

const benefits = [
  {
    icon: Clock,
    title: "Live Queue",
    description: "Customers see real-time queue position. No more 'Is my print ready?' calls.",
    stat: "80%",
    statLabel: "Fewer calls",
  },
  {
    icon: PhoneOff,
    title: "Reduce Calls",
    description: "Automated notifications and live tracking eliminate status inquiry calls.",
    stat: "95%",
    statLabel: "Customer satisfaction",
  },
  {
    icon: Zap,
    title: "More Efficient",
    description: "Smart queue management and bulk operations double your shop's throughput.",
    stat: "2x",
    statLabel: "Faster processing",
  },
  {
    icon: TrendingUp,
    title: "More Business",
    description: "Accept orders 24/7 through the online portal. Never miss a customer again.",
    stat: "40%",
    statLabel: "Revenue increase",
  },
]

export function LandingBenefits() {
  return (
    <section className="border-t px-4 py-20 lg:py-28">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why print shops love PrintQ
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join hundreds of print shops that have transformed their business.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border bg-card p-6 text-center transition-all hover:shadow-lg"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="mb-2 text-3xl font-bold text-primary">{benefit.stat}</div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {benefit.statLabel}
                </div>
                <h3 className="mb-2 mt-4 text-lg font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
