export interface User {
  id: string
  name: string
  email: string
  phone?: string
  image?: string
  role: "super_admin" | "shop_owner" | "staff" | "customer"
  emailVerified?: Date
  isTwoFactorEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Shop {
  id: string
  name: string
  slug: string
  address: string
  city: string
  state: string
  pinCode: string
  phone: string
  email: string
  logo?: string
  status: "pending" | "active" | "suspended" | "inactive"
  timezone: string
  autoDeleteDays: number
  branding?: ShopBranding
  ownerId: string
  owner?: User
  createdAt: Date
  updatedAt: Date
}

export interface ShopBranding {
  primaryColor: string
  logo?: string
  favicon?: string
  customDomain?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  totalOrders: number
  totalSpent: number
  shopId: string
  userId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomerPrintSettings {
  pageRange: "all" | "custom"
  customPageRange?: string
  orientation: "portrait" | "landscape"
  printQuality: "draft" | "normal" | "high"
  finishingOptions: string[]
}

export interface OperatorPrintSettings {
  paperTray: string
  pagesPerSheet: number
  layoutDirection: "horizontal" | "reverse-horizontal" | "vertical" | "reverse-vertical"
  paperHandling: "auto" | "manual" | "tray"
  scaling: number
  autoRotate: boolean
  colorMode: "auto" | "color" | "grayscale" | "monochrome"
  dpi: number
  margins: "none" | "minimum" | "normal" | "custom"
  customMarginTop?: number
  customMarginBottom?: number
  customMarginLeft?: number
  customMarginRight?: number
  brightness: number
  contrast: number
}

export interface Order {
  id: string
  orderId: string
  status: "pending" | "received" | "in_queue" | "processing" | "printing" | "quality_check" | "ready" | "completed" | "cancelled" | "refunded"
  priority: "low" | "normal" | "high" | "urgent"
  pages: number
  copies: number
  color: string
  paperSize: string
  sides: string
  finishing?: string
  amount: number
  discount?: number
  total: number
  notes?: string
  printNotes?: string
  printSettings?: CustomerPrintSettings & { operator?: OperatorPrintSettings }
  customerId: string
  customer?: Customer
  shopId: string
  files?: PrintFile[]
  queuePosition?: number
  estimatedReadyAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PrintFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  pages: number
  orderId: string
  createdAt: Date
}

export interface Printer {
  id: string
  name: string
  model: string
  status: "online" | "offline" | "busy" | "error"
  paperLevel: number
  inkLevel: number
  paperSize: string[]
  colorCapable: boolean
  duplexCapable: boolean
  shopId: string
  createdAt: Date
  updatedAt: Date
}

export interface QueueItem {
  id: string
  position: number
  priority: "low" | "normal" | "high" | "urgent"
  status: "queued" | "printing" | "completed"
  orderId: string
  order?: Order
  printerId?: string
  printer?: Printer
  assignedTo?: string
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
}

export interface StaffMember {
  id: string
  userId: string
  user?: User
  shopId: string
  role: string
  permissions: string[]
  status: "active" | "inactive" | "invited"
  createdAt: Date
}

export interface Subscription {
  id: string
  shopId: string
  planId: string
  status: "active" | "past_due" | "cancelled" | "expired"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  createdAt: Date
}

export interface Plan {
  id: string
  name: string
  slug: string
  description: string
  price: number
  yearlyPrice: number
  features: string[]
  limits: Record<string, number>
  isActive: boolean
  createdAt: Date
}

export interface Invoice {
  id: string
  invoiceId: string
  shopId: string
  amount: number
  status: "pending" | "paid" | "failed" | "refunded"
  dueDate: Date
  paidAt?: Date
  stripeInvoiceId?: string
  createdAt: Date
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "order" | "payment" | "system" | "alert"
  read: boolean
  userId: string
  shopId?: string
  link?: string
  createdAt: Date
}

export interface Ticket {
  id: string
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "normal" | "high" | "urgent"
  userId: string
  user?: User
  shopId?: string
  assignedTo?: string
  messages?: TicketMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface TicketMessage {
  id: string
  ticketId: string
  userId: string
  user?: User
  message: string
  createdAt: Date
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image?: string
  category: string
  tags: string[]
  published: boolean
  authorId: string
  author?: User
  createdAt: Date
  updatedAt: Date
}

export interface CMSPage {
  id: string
  title: string
  slug: string
  content: string
  type: "page" | "policy" | "faq"
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Coupon {
  id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minOrder?: number
  maxUses?: number
  usedCount: number
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
}

export interface ActivityLog {
  id: string
  action: string
  entity: string
  entityId: string
  userId: string
  user?: User
  shopId?: string
  metadata?: Record<string, unknown>
  ip?: string
  userAgent?: string
  createdAt: Date
}

export interface PricingRule {
  id: string
  shopId: string
  paperSize: string
  colorType: "black_white" | "color"
  pricePerPage: number
  minCopies?: number
  isActive: boolean
  createdAt: Date
}

export interface DashboardStats {
  revenue: number
  revenueChange: number
  orders: number
  ordersChange: number
  pagesPrinted: number
  pagesChange: number
  pendingOrders: number
  pendingChange: number
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
