"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Bell, Globe, Eye } from "lucide-react"

export default function CustomerSettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("customer-settings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setDarkMode(parsed.darkMode ?? false)
        setPushNotifications(parsed.pushNotifications ?? true)
      } catch { /* ignore */ }
    } else if (document.documentElement.classList.contains("dark")) {
      setDarkMode(true)
    }
    setLoaded(true)
  }, [])

  const save = (key: string, value: boolean) => {
    const current = JSON.parse(localStorage.getItem("customer-settings") || "{}")
    const next = { ...current, [key]: value }
    localStorage.setItem("customer-settings", JSON.stringify(next))
  }

  const handleDarkMode = (v: boolean) => {
    setDarkMode(v)
    save("darkMode", v)
    document.documentElement.classList.toggle("dark", v)
    toast.success(v ? "Dark mode enabled" : "Light mode enabled")
  }

  const handlePushNotifications = (v: boolean) => {
    setPushNotifications(v)
    save("pushNotifications", v)
    toast.success(v ? "Push notifications enabled" : "Push notifications disabled")
  }

  return (
    <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div><p className="font-medium">Language</p><p className="text-sm text-muted-foreground">English (India)</p></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <div><p className="font-medium">Dark Mode</p><p className="text-sm text-muted-foreground">Toggle dark theme</p></div>
                </div>
                <Switch checked={darkMode} onCheckedChange={handleDarkMode} disabled={!loaded} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div><p className="font-medium">Push Notifications</p><p className="text-sm text-muted-foreground">Receive order updates</p></div>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={handlePushNotifications} disabled={!loaded} />
              </div>
            </CardContent>
          </Card>
    </div>
  )
}
