"use client"

import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Search, HelpCircle, FileText, MessageSquare, ChevronRight } from "lucide-react"
import Link from "next/link"

const categories = [
  { icon: HelpCircle, title: "Getting Started", count: 12, description: "New to PrintQ? Start here." },
  { icon: FileText, title: "Upload & Orders", count: 8, description: "Learn about uploading and managing orders." },
  { icon: MessageSquare, title: "Account & Billing", count: 6, description: "Manage your account and subscription." },
  { icon: HelpCircle, title: "Troubleshooting", count: 10, description: "Common issues and solutions." },
]

const popularArticles = [
  "How to upload a print job",
  "Understanding pricing calculations",
  "Tracking your order status",
  "Setting up your print shop",
  "Managing staff permissions",
]

export default function HelpPage() {
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
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Help Center</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Find answers to common questions and learn how to use PrintQ effectively.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mx-auto mt-8 max-w-2xl"
          >
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search for answers..." className="h-12 pl-12 text-base" />
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer rounded-xl border bg-card p-6 transition-all hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold">{category.title}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{category.description}</p>
                  <span className="text-xs text-muted-foreground">{category.count} articles</span>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h2 className="mb-6 text-2xl font-bold">Popular Articles</h2>
            <div className="rounded-xl border bg-card divide-y">
              {popularArticles.map((article, index) => (
                <Link
                  key={article}
                  href="#"
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
                >
                  <span className="text-sm font-medium">{article}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="rounded-2xl border bg-muted/30 px-8 py-12">
              <h2 className="text-2xl font-bold">Still need help?</h2>
              <p className="mt-2 text-muted-foreground">
                Our support team is ready to assist you.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link href="/public/contact">
                  <Button>Contact Support</Button>
                </Link>
                <Link href="/public/contact">
                  <Button variant="outline">Live Chat</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
