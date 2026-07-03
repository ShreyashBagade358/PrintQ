"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Owner, PrintPro Delhi",
    content: "PrintQ transformed our business. We went from managing orders on WhatsApp to a fully automated system. Our revenue has doubled in 3 months.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Manager, CopyCat Mumbai",
    content: "The live queue feature is a game-changer. Customers can see exactly when their order will be ready. No more constant phone calls!",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Owner, Digital Prints Bangalore",
    content: "Setting up was incredibly easy. The pricing engine automatically calculates costs, and the analytics help us make better business decisions.",
    rating: 5,
  },
]

export function LandingTestimonials() {
  return (
    <section className="border-t bg-muted/30 px-4 py-20 lg:py-28">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by print shop owners
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hear from the businesses that use PrintQ every day.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border bg-card p-6"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-4 text-sm text-muted-foreground">&ldquo;{testimonial.content}&rdquo;</p>
              <div>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
