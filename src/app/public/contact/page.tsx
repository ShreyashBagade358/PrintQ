"use client"

import { motion } from "framer-motion"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock, MessageSquare, HelpCircle, FileText } from "lucide-react"

export default function ContactPage() {
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
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact Us</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Have a question or need help? We&apos;re here for you.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">hello@printq.com</p>
                  <p className="text-sm text-muted-foreground">support@printq.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <Phone className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-sm text-muted-foreground">+91 1800-123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="text-sm text-muted-foreground">
                    42, PrintQ Tower, Sector 14<br />
                    Gurugram, Haryana 122001<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <Clock className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Working Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Mon - Sat: 9:00 AM - 6:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="rounded-xl border bg-card p-8">
                <h2 className="mb-6 text-2xl font-bold">Send us a message</h2>
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Full Name" placeholder="John Doe" />
                    <Input label="Email" type="email" placeholder="john@example.com" />
                  </div>
                  <Input label="Subject" placeholder="How can we help?" />
                  <Textarea label="Message" placeholder="Tell us more about your inquiry..." className="min-h-[150px]" />
                  <Button size="lg" className="w-full sm:w-auto">
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-xl border bg-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Chat with our support team in real-time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border bg-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Help Center</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse our knowledge base for answers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border bg-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Submit Ticket</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a support ticket for complex issues.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
