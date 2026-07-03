"use client"

import { motion } from "framer-motion"
import { Upload, Eye, ClipboardList, Shield, Trash2 } from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Drag and drop PDF, DOCX, PNG, or JPG files. Automatic page detection and smart file validation.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Eye,
    title: "Live Tracking",
    description: "Customers can track their orders in real-time. From upload to completion, every step is visible.",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: ClipboardList,
    title: "Smart Queue",
    description: "Intelligent queue management with priority settings. Optimize your print workflow automatically.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Shield,
    title: "Secure Files",
    description: "Enterprise-grade encryption for all uploaded files. Auto-delete after delivery for privacy.",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: Trash2,
    title: "Auto Delete",
    description: "Files are automatically deleted after your chosen retention period. No manual cleanup needed.",
    color: "from-rose-500 to-rose-600",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="border-t px-4 py-20 lg:py-28">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to manage your print shop
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed to streamline your print workflow from start to finish.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-br ${feature.color} p-3 text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
