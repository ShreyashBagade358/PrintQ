"use client"

import { motion } from "framer-motion"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronRight, Calendar, User } from "lucide-react"
import Link from "next/link"

const categories = ["All", "Tips & Tricks", "Industry News", "Product Updates", "Tutorials"]

const articles = [
  {
    title: "10 Ways to Improve Your Print Shop Efficiency",
    excerpt: "Discover proven strategies to streamline your print shop operations and increase throughput.",
    category: "Tips & Tricks",
    author: "PrintQ Team",
    date: "Jan 15, 2025",
    image: "/blog/efficiency.jpg",
    slug: "improve-print-shop-efficiency",
  },
  {
    title: "The Future of Print Management: 2025 Trends",
    excerpt: "Explore the latest trends shaping the print industry and how to stay ahead of the curve.",
    category: "Industry News",
    author: "PrintQ Team",
    date: "Jan 10, 2025",
    image: "/blog/trends.jpg",
    slug: "print-management-trends-2025",
  },
  {
    title: "New: Smart Queue AI-Powered Prioritization",
    excerpt: "Introducing our new AI-powered queue system that automatically prioritizes orders.",
    category: "Product Updates",
    author: "PrintQ Team",
    date: "Jan 5, 2025",
    image: "/blog/smart-queue.jpg",
    slug: "smart-queue-ai-prioritization",
  },
  {
    title: "How to Set Up Custom Pricing Rules",
    excerpt: "A step-by-step guide to configuring custom pricing rules for your print shop.",
    category: "Tutorials",
    author: "PrintQ Team",
    date: "Dec 28, 2024",
    image: "/blog/pricing.jpg",
    slug: "custom-pricing-rules-guide",
  },
  {
    title: "Reducing Paper Waste in Your Print Shop",
    excerpt: "Learn how to minimize paper waste and run a more sustainable print business.",
    category: "Tips & Tricks",
    author: "PrintQ Team",
    date: "Dec 20, 2024",
    image: "/blog/sustainable.jpg",
    slug: "reducing-paper-waste",
  },
  {
    title: "Integrating PrintQ with Your Existing Workflow",
    excerpt: "A comprehensive guide to integrating PrintQ into your current print shop workflow.",
    category: "Tutorials",
    author: "PrintQ Team",
    date: "Dec 15, 2024",
    image: "/blog/integration.jpg",
    slug: "integrating-printq-workflow",
  },
]

export default function BlogPage() {
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
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Tips, tutorials, and news from the PrintQ team.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mx-auto mt-8 max-w-md"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search articles..." className="pl-9" />
          </motion.div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg"
              >
                <Link href={`/public/blog/article?slug=${article.slug}`}>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                    <span className="text-4xl">📄</span>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {article.category}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {article.date}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
