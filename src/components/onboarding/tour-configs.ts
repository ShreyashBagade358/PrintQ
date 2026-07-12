import type { Step } from "react-joyride"

export const customerTourSteps: Step[] = [
  {
    target: "body",
    content: "Upload your documents, track orders, and get high-quality prints delivered. Let's take a quick tour of your dashboard.",
    title: "Welcome to PrintQ!",
    placement: "center",
  },
  {
    target: "[data-tour='customer-stats']",
    content: "View your total orders, pages printed, total spent, and active orders at a glance.",
    title: "Your Dashboard Stats",
    placement: "bottom",
  },
  {
    target: "[data-tour='customer-actions']",
    content: "Quick shortcuts to place a new print job, scan a shop's QR code, or track an existing order.",
    title: "Quick Actions",
    placement: "left",
  },
  {
    target: "[data-tour='customer-orders']",
    content: "All your recent orders appear here with live status updates.",
    title: "Recent Orders",
    placement: "top",
  },
  {
    target: "[data-tour='customer-upload']",
    content: "Upload files, configure print settings (paper size, color, copies), and place your order here.",
    title: "New Print Job",
    placement: "right",
  },
  {
    target: "[data-tour='customer-scan']",
    content: "Scan a shop's QR code to connect with them and send print jobs directly.",
    title: "Scan Shop QR",
    placement: "right",
  },
  {
    target: "[data-tour='customer-notif']",
    content: "Get notified when your order status changes or when prints are ready.",
    title: "Notifications",
    placement: "bottom",
  },
  {
    target: "body",
    content: "You're all set! Use the ? button in the top bar anytime to replay this tour.",
    title: "You're Ready!",
    placement: "center",
  },
]

export const shopTourSteps: Step[] = [
  {
    target: "body",
    content: "Manage your shop, handle print jobs, track orders, and grow your business. Let's take a quick tour of your dashboard.",
    title: "Welcome to PrintQ!",
    placement: "center",
  },
  {
    target: "[data-tour='shop-stats']",
    content: "Your key metrics: revenue, total orders, pages printed, and pending orders.",
    title: "Shop Statistics",
    placement: "bottom",
  },
  {
    target: "[data-tour='shop-qr']",
    content: "Share this QR code with customers so they can scan and send you print jobs directly.",
    title: "Shop QR Code",
    placement: "left",
  },
  {
    target: "[data-tour='shop-orders-table']",
    content: "New orders appear here in real-time. Click an order to manage it.",
    title: "Recent Orders",
    placement: "top",
  },
  {
    target: "[data-tour='shop-queue']",
    content: "Manage your print queue: assign printers, set priorities, start and complete jobs.",
    title: "Active Queue",
    placement: "right",
  },
  {
    target: "[data-tour='shop-orders-nav']",
    content: "View all orders with filtering by status — active, completed, or cancelled.",
    title: "Orders",
    placement: "right",
  },
  {
    target: "[data-tour='shop-printers']",
    content: "Add and manage your printers. Check ink and paper levels, go online or offline.",
    title: "Printers",
    placement: "right",
  },
  {
    target: "[data-tour='shop-pricing']",
    content: "Set per-page pricing for different paper sizes, color types, and finishing options.",
    title: "Pricing",
    placement: "right",
  },
  {
    target: "[data-tour='shop-notif']",
    content: "Get notified of new orders, payments received, and system alerts.",
    title: "Notifications",
    placement: "bottom",
  },
  {
    target: "body",
    content: "You're all set! Use the ? button in the top bar anytime to replay this tour.",
    title: "You're Ready!",
    placement: "center",
  },
]
