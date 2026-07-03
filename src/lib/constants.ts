export const APP_NAME = "PrintQ"
export const APP_DESCRIPTION = "Cloud-based Print Shop Management System"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  SHOP_OWNER: "shop_owner",
  STAFF: "staff",
  CUSTOMER: "customer",
} as const

export const ORDER_STATUS = {
  PENDING: "pending",
  RECEIVED: "received",
  IN_QUEUE: "in_queue",
  PROCESSING: "processing",
  PRINTING: "printing",
  QUALITY_CHECK: "quality_check",
  READY: "ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const

export const QUEUE_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const

export const PAPER_SIZES = ["A4", "A3", "A5", "Letter", "Legal", "Tabloid"] as const
export const COLOR_OPTIONS = ["Black & White", "Color"] as const
export const SIDES_OPTIONS = ["Single Sided", "Double Sided"] as const
export const FINISHING_OPTIONS = ["None", "Stapled", "Spiral Bound", "Hardcover", "Laminated"] as const

export const FILE_TYPES = {
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  PNG: "image/png",
  JPG: "image/jpeg",
} as const

export const SUPPORTED_FILE_TYPES = [
  { label: "PDF", value: FILE_TYPES.PDF, icon: "FileText" },
  { label: "DOCX", value: FILE_TYPES.DOCX, icon: "FileText" },
  { label: "PNG", value: FILE_TYPES.PNG, icon: "Image" },
  { label: "JPG", value: FILE_TYPES.JPG, icon: "Image" },
] as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const SHOP_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  INACTIVE: "inactive",
} as const

export const PLANS = {
  STARTER: "starter",
  PROFESSIONAL: "professional",
  BUSINESS: "business",
} as const

export const PLAN_LIMITS = {
  [PLANS.STARTER]: {
    staff: 2,
    storage: 1024 * 1024 * 1024,
    ordersPerMonth: 500,
    printers: 2,
  },
  [PLANS.PROFESSIONAL]: {
    staff: 10,
    storage: 10 * 1024 * 1024 * 1024,
    ordersPerMonth: 2000,
    printers: 10,
  },
  [PLANS.BUSINESS]: {
    staff: -1,
    storage: -1,
    ordersPerMonth: -1,
    printers: -1,
  },
} as const

export const QUALITY_OPTIONS = ["draft", "normal", "high"] as const
export const ORIENTATION_OPTIONS = ["portrait", "landscape"] as const
export const COLOR_MODE_OPTIONS = ["auto", "color", "grayscale", "monochrome"] as const
export const MARGIN_OPTIONS = ["none", "minimum", "normal", "custom"] as const
export const LAYOUT_DIRECTION_OPTIONS = ["horizontal", "reverse-horizontal", "vertical", "reverse-vertical"] as const
export const PAPER_HANDLING_OPTIONS = ["auto", "manual", "tray"] as const
export const PAPER_TRAY_OPTIONS = ["auto", "tray-1", "tray-2", "tray-3", "manual"] as const
export const FINISHING_CHECKBOXES = ["staple", "punch", "fold", "lamination"] as const
export const DPI_OPTIONS = [150, 200, 300, 600, 1200] as const
export const PAGES_PER_SHEET_OPTIONS = [1, 2, 4, 6, 8, 9, 16] as const

export const DEFAULT_PRICING = {
  blackWhite: { A4: 2, A3: 4, A5: 1, Letter: 2, Legal: 3, Tabloid: 5 },
  color: { A4: 10, A3: 20, A5: 5, Letter: 10, Legal: 12, Tabloid: 20 },
  doubleSided: true,
  finishing: { staple: 5, punch: 3, fold: 8, lamination: 20 },
  qualityMultiplier: { draft: 0.75, normal: 1, high: 1.5 },
}
