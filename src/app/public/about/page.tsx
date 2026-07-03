"use client"

import { motion } from "framer-motion"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Button } from "@/components/ui/button"
import { Target, Eye, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"

const timeline = [
  { year: "2020", event: "PrintQ founded with a vision to digitize print shops" },
  { year: "2021", event: "Launched beta with 10 print shops across Delhi" },
  { year: "2022", event: "Crossed 100 shops and raised seed funding" },
  { year: "2023", event: "Introduced AI-powered smart queue system" },
  { year: "2024", event: "Expanded to 500+ shops across India" },
  { year: "2025", event: "Launched enterprise features and API platform" },
]

export default function AboutPage() {
  return (
    <>
      <PublicNavbar />
      <main>
        <section className="px-4 py-20">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About PrintQ</h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                We&apos;re on a mission to modernize the print industry, one shop at a time.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="border-t bg-muted/30 px-4 py-20">
          <div className="container mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-xl border bg-card p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Our Mission</h3>
                <p className="text-muted-foreground">
                  To empower every print shop with modern digital tools that streamline operations and drive growth.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border bg-card p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                  <Eye className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Our Vision</h3>
                <p className="text-muted-foreground">
                  A world where every print shop runs on smart, connected systems that delight customers.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border bg-card p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Our Values</h3>
                <p className="text-muted-foreground">
                  Customer-first, innovation-driven, and committed to making print simple for everyone.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="container mx-auto max-w-4xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center text-3xl font-bold"
            >
              Our Story
            </motion.h2>
            <div className="relative">
              <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary/50 to-primary/10" />
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`relative flex items-center gap-8 ${
                      index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                      <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">{item.event}</p>
                      </div>
                    </div>
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary text-sm font-bold text-white">
                      {item.year}
                    </div>
                    <div className="flex-1" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 px-4 py-20 text-center">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-gradient-to-br from-primary to-blue-700 px-8 py-16 text-white"
            >
              <h2 className="text-3xl font-bold">Join the PrintQ family</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/80">
                Start your journey with 500+ print shops that trust PrintQ.
              </p>
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="mt-6 gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  )
}
