"use client"

import { motion } from "framer-motion"
import { Printer } from "lucide-react"

const shops = [
  "PrintPro Delhi", "CopyCat Mumbai", "Digital Prints Bangalore",
  "QuickPrint Chennai", "Alpha Graphics Pune", "City Press Hyderabad",
]

export function LandingTrustedShops() {
  return (
    <section className="border-t px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground"
        >
          Trusted by 500+ print shops across India
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {shops.map((shop, index) => (
            <motion.div
              key={shop}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <Printer className="h-4 w-4" />
              {shop}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
