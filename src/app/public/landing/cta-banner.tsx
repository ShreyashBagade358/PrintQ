"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function LandingCTABanner() {
  return (
    <section className="px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-700 px-8 py-16 text-center text-white"
        >
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white/5" />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform your print shop?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Join 500+ print shops already using PrintQ. Start your free trial today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/register">
                <Button size="xl" variant="secondary" className="gap-2 text-base">
                  Join Today
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/public/pricing">
                <Button size="xl" variant="outline" className="gap-2 border-white/20 text-base text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
