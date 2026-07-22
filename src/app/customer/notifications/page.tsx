"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, CheckCheck, Loader2, Inbox } from "lucide-react"
import { getNotificationsAction, markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/actions/notification.actions"
import { timeAgo } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  link: string | null
  createdAt: string
}

export default function CustomerNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchData = useCallback(async () => {
    const data = await getNotificationsAction() as unknown as NotificationItem[]
    setNotifications(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    const result = await markAllNotificationsReadAction()
    setMarkingAll(false)
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success("All notifications marked as read")
    } else {
      toast.error(result.error || "Failed to mark all as read")
    }
  }

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await markNotificationReadAction(notif.id)
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    }
    if (notif.link) {
      router.push(notif.link)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <span className="flex h-6 items-center rounded-full bg-primary px-2.5 text-xs font-medium text-primary-foreground">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="gap-2" onClick={handleMarkAllRead} loading={markingAll}>
                <CheckCheck className="h-4 w-4" /> Mark All Read
              </Button>
            )}
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-4 sm:p-8">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="p-4 sm:p-8">
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Inbox className="h-12 w-12 mb-4" />
                  <p className="font-medium">No notifications yet</p>
                  <p className="text-sm mt-1">Notifications about your orders will appear here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 p-4 transition-colors cursor-pointer hover:bg-muted/50 ${
                      !notif.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      notif.type === "order" ? "bg-blue-100 text-blue-600"
                        : notif.type === "payment" ? "bg-emerald-100 text-emerald-600"
                        : notif.type === "alert" ? "bg-amber-100 text-amber-600"
                        : "bg-purple-100 text-purple-600"
                    }`}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{notif.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                        </div>
                        {!notif.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
    </div>
  )
}
