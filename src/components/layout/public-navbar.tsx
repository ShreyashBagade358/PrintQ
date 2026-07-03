"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, Printer, Store, User, ChevronDown, LayoutDashboard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const navLinks = [
  { href: "/public/landing", label: "Home" },
  { href: "/public/pricing", label: "Pricing" },
  { href: "/public/about", label: "About" },
  { href: "/public/contact", label: "Contact" },
  { href: "/public/blog", label: "Blog" },
  { href: "/public/help", label: "Help" },
]

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const { data: session } = useSession()
  const user = session?.user

  const dashboardHref = user?.role === "SHOP_OWNER" || user?.role === "STAFF"
    ? "/shop/dashboard"
    : user?.role === "CUSTOMER"
    ? "/customer/dashboard"
    : user?.role === "SUPER_ADMIN"
    ? "/admin/dashboard"
    : "/"

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/public/landing" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Printer className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">PrintQ</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href={dashboardHref}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setLoginOpen(!loginOpen)} className="gap-1">
                  Log In <ChevronDown className={cn("h-3 w-3 transition-transform", loginOpen && "rotate-180")} />
                </Button>
                <AnimatePresence>
                  {loginOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-1 w-56 rounded-xl border bg-card p-1.5 shadow-lg"
                      onMouseLeave={() => setLoginOpen(false)}
                    >
                      <Link href="/auth/shop-login" onClick={() => setLoginOpen(false)}>
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                            <Store className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Shop Login</p>
                            <p className="text-xs text-muted-foreground">Owners & Staff</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/auth/customer-login" onClick={() => setLoginOpen(false)}>
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                            <User className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">Customer Login</p>
                            <p className="text-xs text-muted-foreground">Track your orders</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t md:hidden"
          >
            <div className="container mx-auto space-y-2 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 space-y-2">
                {user ? (
                  <>
                    <Link href={dashboardHref} onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => signOut({ callbackUrl: "/" })}>
                      <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/shop-login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Store className="h-4 w-4" /> Shop Login
                      </Button>
                    </Link>
                    <Link href="/auth/customer-login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <User className="h-4 w-4" /> Customer Login
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
