"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Upload, Eye, Bell, CreditCard, Inbox, Printer, CheckCircle, Wallet,
  ArrowRight, ArrowLeft, QrCode, Zap, Sparkles, Play, Pause,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "01",
    customer: {
      icon: Upload,
      title: "Upload Print Job",
      desc: "Customer uploads PDF, DOCX, or image files through the web portal. Files are auto-validated, page count detected, and a unique QR token is generated linking the customer to their order.",
      detail: "Files are encrypted at rest. Auto page detection supports single & double-sided.",
      color: "from-blue-500 to-blue-600",
    },
    shop: {
      icon: Inbox,
      title: "Receives in Queue",
      desc: "The job instantly appears in the shop's live queue with a unique order ID. Staff can preview the file, see page count, and review customer notes before pricing.",
      detail: "Queue supports drag-drop reordering. Priority badges for urgent jobs.",
      color: "from-indigo-500 to-indigo-600",
    },
    connection: "QR token links customer → order → shop. Scan to retrieve instantly.",
    connectionIcon: QrCode,
  },
  {
    number: "02",
    customer: {
      icon: Eye,
      title: "Gets Price Estimate",
      desc: "Customer receives a real-time price notification. The estimate includes per-page cost, color/B&W pricing, binding options, and estimated completion time.",
      detail: "Pricing is auto-calculated based on the shop's preset rates. Customer can approve or ask questions.",
      color: "from-emerald-500 to-emerald-600",
    },
    shop: {
      icon: CheckCircle,
      title: "Reviews & Sets Price",
      desc: "Staff reviews the file, selects paper size, color mode, quantity, and any finishing options. The system auto-calculates price using the shop's pricing rules.",
      detail: "Custom discounts can be applied. Price is final once submitted to customer.",
      color: "from-teal-500 to-teal-600",
    },
    connection: "Pricing update pushed live to customer via WebSocket. No refresh needed.",
    connectionIcon: Zap,
  },
  {
    number: "03",
    customer: {
      icon: Bell,
      title: "Tracks Live Status",
      desc: "Customer can see real-time order status — Queued → Printing → Quality Check → Ready. Each status change shows a timestamp and optional staff note.",
      detail: "Live tracking page is accessible via the unique order link or QR code.",
      color: "from-purple-500 to-purple-600",
    },
    shop: {
      icon: Printer,
      title: "Prints & Processes",
      desc: "Staff assigns the job to an available printer, adjusts print settings (copies, duplex, color profile), and starts the print. Status updates automatically.",
      detail: "Multiple printers can run simultaneously. Queue intelligently assigns next job.",
      color: "from-cyan-500 to-cyan-600",
    },
    connection: "Each status transition triggers a push notification to the customer's dashboard.",
    connectionIcon: Sparkles,
  },
  {
    number: "04",
    customer: {
      icon: Bell,
      title: "Receives Notification",
      desc: "Customer gets an instant SMS and email notification: 'Your order is ready for collection!' Includes the shop address, operating hours, and total amount due.",
      detail: "Notifications are configurable — SMS, email, or both. Delivery reports tracked.",
      color: "from-orange-500 to-orange-600",
    },
    shop: {
      icon: CheckCircle,
      title: "Marks Order Complete",
      desc: "Staff marks the order as 'Ready for Collection' with one click. The system auto-sends notifications to the customer and logs the completion time.",
      detail: "Orders can be marked as 'Delivered' once collected, completing the lifecycle.",
      color: "from-amber-500 to-amber-600",
    },
    connection: "Auto-triggered multi-channel notification — SMS API + email service.",
    connectionIcon: Zap,
  },
  {
    number: "05",
    customer: {
      icon: CreditCard,
      title: "Collects & Pays",
      desc: "Customer visits the shop, shows the order QR code or order ID, reviews the final output, and pays online (UPI/Card) or at the counter.",
      detail: "Digital invoice emailed automatically. Payment status updates in real-time.",
      color: "from-rose-500 to-rose-600",
    },
    shop: {
      icon: Wallet,
      title: "Payment Received",
      desc: "Staff marks payment as received. The system generates a digital receipt, updates earnings reports, and archives the order (auto-deletes files per retention policy).",
      detail: "Payment history available in shop dashboard. Export reports for accounting.",
      color: "from-pink-500 to-pink-600",
    },
    connection: "Payment confirmation syncs both sides. Receipt stored permanently in order history.",
    connectionIcon: Sparkles,
  },
]

export function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [completed, setCompleted] = useState<number[]>([])

  const totalSteps = steps.length
  const step = steps[currentStep]

  const goTo = useCallback((index: number) => {
    setCurrentStep(index)
    setCompleted((prev) => Array.from(new Set([...prev, index])))
  }, [])

  const next = useCallback(() => {
    if (currentStep < totalSteps - 1) goTo(currentStep + 1)
    else { setAutoPlay(false) }
  }, [currentStep, totalSteps, goTo])

  const prev = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }, [currentStep])

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => { next() }, 4000)
    return () => clearInterval(timer)
  }, [autoPlay, next])

  const CustomerIcon = step.customer.icon
  const ShopIcon = step.shop.icon
  const ConnectionIcon = step.connectionIcon

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-modal border"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 lg:p-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <h2 className="text-2xl font-bold tracking-tight">How PrintQ Works</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  A step-by-step walkthrough of the customer & shop owner workflow
                </p>
              </motion.div>

              {/* Progress */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {steps.map((s, i) => (
                  <button key={s.number} onClick={() => goTo(i)} className="group flex items-center gap-1.5">
                    <div
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                        i === currentStep
                          ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                          : completed.includes(i)
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {completed.includes(i) && i !== currentStep ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        s.number
                      )}
                      {i === currentStep && (
                        <motion.span
                          layoutId="activeStep"
                          className="absolute inset-0 rounded-full bg-primary"
                        />
                      )}
                    </div>
                    {i < totalSteps - 1 && (
                      <div className={`h-0.5 w-8 sm:w-12 transition-colors duration-300 ${
                        i < currentStep ? "bg-primary/40" : "bg-muted"
                      }`} />
                    )}
                  </button>
                ))}
              </div>

              {/* Main Content */}
              <div className="relative grid gap-6 lg:grid-cols-2 lg:gap-8">
                {/* Center Glow Line */}
                <div className="absolute left-1/2 top-0 bottom-0 hidden lg:block -translate-x-px">
                  <div className="h-full w-px bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5" />
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"
                  />
                </div>

                {/* Customer Side */}
                <motion.div
                  key={`c-${currentStep}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-7 w-1 rounded-full bg-blue-500" />
                    <div>
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Customer</span>
                      <h3 className="text-sm font-bold">{step.customer.title}</h3>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-gradient-to-br from-blue-50/50 to-white p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.customer.color} text-white shadow-md`}>
                        <CustomerIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.customer.desc}
                        </p>
                        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-white rounded-lg border p-2.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                          <span>{step.customer.detail}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Shop Side */}
                <motion.div
                  key={`s-${currentStep}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-7 w-1 rounded-full bg-indigo-500" />
                    <div>
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Shop Owner</span>
                      <h3 className="text-sm font-bold">{step.shop.title}</h3>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-gradient-to-br from-indigo-50/50 to-white p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.shop.color} text-white shadow-md`}>
                        <ShopIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.shop.desc}
                        </p>
                        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-white rounded-lg border p-2.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                          <span>{step.shop.detail}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Connection Badge */}
                <motion.div
                  key={`conn-${currentStep}`}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="col-span-full"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dashed border-primary/20" />
                    </div>
                    <div className="relative flex items-center gap-2.5 bg-gradient-to-r from-blue-50 via-primary/5 to-indigo-50 rounded-full border border-primary/20 px-5 py-2.5 shadow-sm">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                        <ConnectionIcon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{step.connection}</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Step Summary */}
              <motion.div
                key={`progress-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex items-center justify-between"
              >
                <span className="text-xs text-muted-foreground">
                  Step {step.number} of 0{totalSteps}
                </span>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === currentStep ? "w-6 bg-primary" : i < currentStep ? "w-1.5 bg-primary/30" : "w-1.5 bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(((currentStep + 1) / totalSteps) * 100)}%
                </span>
              </motion.div>

              {/* Controls */}
              <div className="mt-6 flex items-center justify-between border-t pt-5">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`gap-1.5 text-xs ${autoPlay ? "border-primary text-primary bg-primary/5" : ""}`}
                  >
                    {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {autoPlay ? "Pause" : "Auto-Play"}
                  </Button>
                  {autoPlay && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: 120 }}
                      className="h-1 rounded-full bg-muted overflow-hidden"
                    >
                      <motion.div
                        key={currentStep}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4, ease: "linear" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={prev} disabled={currentStep === 0} className="gap-1 text-xs">
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </Button>
                  <Button
                    size="sm"
                    onClick={next}
                    className="gap-1 text-xs bg-primary hover:bg-primary/90"
                  >
                    {currentStep === totalSteps - 1 ? "Finish" : "Next"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
