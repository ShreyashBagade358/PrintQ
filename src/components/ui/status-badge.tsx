"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  received: "bg-blue-100 text-blue-800",
  in_queue: "bg-cyan-100 text-cyan-800",
  processing: "bg-indigo-100 text-indigo-800",
  printing: "bg-purple-100 text-purple-800",
  quality_check: "bg-amber-100 text-amber-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
  online: "bg-emerald-100 text-emerald-800",
  offline: "bg-gray-100 text-gray-800",
  busy: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
  queued: "bg-blue-100 text-blue-800",
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
  paid: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  invited: "bg-blue-100 text-blue-800",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] || statusStyles.pending
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </motion.span>
  )
}
