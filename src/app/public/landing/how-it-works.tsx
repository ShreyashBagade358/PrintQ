"use client"

import { motion } from "framer-motion"
import { Upload, Printer, Bell, CreditCard } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload File",
    description: "Customer uploads the print job through the web portal. Supports PDF, DOCX, PNG, and JPG.",
    step: "01",
  },
  {
    icon: Printer,
    title: "We Print",
    description: "The job appears in the shop queue. Staff reviews, adjusts settings, and sends to the printer.",
    step: "02",
  },
  {
    icon: Bell,
    title: "Receive Notification",
    description: "Customer gets an instant notification when the print job is ready for collection.",
    step: "03",
  },
  {
    icon: CreditCard,
    title: "Collect & Pay",
    description: "Customer collects the prints and pays online or at the shop. Easy and hassle-free.",
    step: "04",
  },
]

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="border-t bg-muted/30 px-4 py-20 lg:py-28">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From upload to collection in four simple steps.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-primary/10" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {step.step}
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="absolute left-[60%] top-10 hidden h-0.5 w-[60%] bg-gradient-to-r from-primary/50 to-transparent md:block" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
