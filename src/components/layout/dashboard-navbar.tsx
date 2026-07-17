"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import { Bell, Search, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUnreadNotificationCountAction } from "@/lib/actions/notification.actions"
import { TutorialButton } from "@/components/onboarding/tutorial-button"

interface DashboardNavbarProps {
  title?: string
  type?: "shop" | "admin" | "customer"
}

export function DashboardNavbar({ title = "Dashboard", type = "shop" }: DashboardNavbarProps) {
  const { data: session } = useSession()
  const user = session?.user
  const initials = (user?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchCount = useCallback(async () => {
    const count = await getUnreadNotificationCountAction()
    setUnreadCount(count)
  }, [])

  useEffect(() => { fetchCount() }, [fetchCount])

  const notifPath = type === "admin" ? "/admin/notifications" : `/${type}/notifications`

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-3 sm:px-4 lg:px-6">
      <div className="flex items-center gap-2 sm:gap-4 w-full">
        {/* Left: Logo + Title */}
        <Link href={`/${type}/dashboard`} className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Printer className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold hidden sm:inline">PrintQ</span>
        </Link>
        <div className="md:hidden flex-1 min-w-0">
          <h1 className="text-base font-semibold truncate">{title}</h1>
        </div>

        {/* Center: Searchbar on desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 w-full" />
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-1 sm:gap-3">
        <TutorialButton />
        <Link href={notifPath}>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name || "User"}</span>
                <span className="text-xs text-muted-foreground">{user?.email || ""}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${type}/profile`}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${type}/settings`}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => signOut({ callbackUrl: "/" })}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
    </header>
  )
}
