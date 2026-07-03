"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What file formats are supported?",
    answer: "We support PDF, DOCX, PNG, and JPG files. Each file can be up to 50MB in size.",
  },
  {
    question: "How does pricing work?",
    answer: "Pricing is calculated based on page count, paper size, color options, and finishing requirements. You'll see the total before confirming your order.",
  },
  {
    question: "Can I track my order in real-time?",
    answer: "Yes! Once you upload your job, you'll get a unique order ID. You can track your order status anytime through our portal.",
  },
  {
    question: "How do I collect my prints?",
    answer: "You'll receive a notification when your prints are ready. Simply visit the shop and quote your order ID to collect.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. All files are encrypted in transit and at rest. Files are automatically deleted after the retention period you choose.",
  },
  {
    question: "Can I cancel my order?",
    answer: "Yes, you can cancel before the printing starts. Refunds are processed according to our refund policy.",
  },
]

export function LandingFAQ() {
  return (
    <section className="border-t bg-muted/30 px-4 py-20 lg:py-28">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Got questions? We&apos;ve got answers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
