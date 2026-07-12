"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  Users,
  Printer,
  BarChart3,
  Receipt,
  CreditCard,
  UserCog,
  User,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Megaphone,
  FileText,
  QrCode,
  ScanLine,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const shopLinks = [
  { href: "/shop/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shop/queue", label: "Active Queue", icon: ClipboardList },
  { href: "/shop/orders", label: "Orders", icon: ShoppingCart },
  { href: "/shop/customers", label: "Customers", icon: Users },
  { href: "/shop/printers", label: "Printers", icon: Printer },
  { href: "/shop/pricing", label: "Pricing", icon: DollarSign },
  { href: "/shop/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/shop/staff", label: "Staff", icon: UserCog },
  { href: "/shop/notifications", label: "Notifications", icon: Bell },
  { href: "/shop/reports", label: "Reports", icon: FileText },
  { href: "/shop/profile", label: "Profile", icon: User },
  { href: "/shop/settings", label: "Settings", icon: Settings },
]

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/shops", label: "Shops", icon: Printer },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/cms", label: "CMS", icon: FileText },
  { href: "/admin/blog", label: "Blog", icon: Megaphone },
  { href: "/admin/help", label: "Help Articles", icon: ClipboardList },
  { href: "/admin/tickets", label: "Tickets", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/coupons", label: "Coupons", icon: DollarSign },
  { href: "/admin/payments", label: "Payments", icon: Receipt },
  { href: "/admin/activity", label: "Activity", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

const customerLinks = [
  { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/upload", label: "Upload Job", icon: ClipboardList },
  { href: "/customer/orders", label: "My Orders", icon: ShoppingCart },
  { href: "/customer/track", label: "Track Order", icon: ClipboardList },
  { href: "/scan", label: "Scan Shop QR", icon: ScanLine },
  { href: "/customer/profile", label: "Profile", icon: UserCog },
  { href: "/customer/notifications", label: "Notifications", icon: Bell },
  { href: "/customer/support", label: "Support", icon: Users },
  { href: "/customer/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  type: "shop" | "admin" | "customer"
}

export function Sidebar({ type }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const links = type === "shop" ? shopLinks : type === "admin" ? adminLinks : customerLinks

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col border-r transition-all duration-300 max-md:hidden",
        "bg-background",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? link.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={cn("border-t p-2", collapsed && "flex justify-center")}>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
