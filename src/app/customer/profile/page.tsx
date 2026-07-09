"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { getProfileAction, updateProfileAction, changePasswordAction } from "@/lib/actions/profile.actions"
import { getCustomerDashboardAction } from "@/lib/actions/profile.actions"
import { toast } from "sonner"
import {
  User, Shield, Bell, Trash2, Loader2, Package, CreditCard, FileText, CheckCircle,
  Key, Smartphone, Globe, Eye,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface CustomerStats {
  totalOrders: number
  pagesPrinted: number
  totalSpent: number
  activeOrders: number
}

export default function CustomerProfilePage() {
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<CustomerStats | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [pending2FA, setPending2FA] = useState(false)

  const [darkMode, setDarkMode] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    Promise.all([getProfileAction(), getCustomerDashboardAction()]).then(([profile, dashboard]) => {
      if (profile?.user) {
        setName(profile.user.name)
        setPhone(profile.user.phone || "")
      }
      if (dashboard) {
        setStats(dashboard.stats as unknown as CustomerStats)
      }
      setLoading(false)
    })

    const saved = localStorage.getItem("customer-profile-settings")
    if (saved) {
      try {
        const p = JSON.parse(saved)
        setDarkMode(p.darkMode ?? false)
        setPushNotifications(p.pushNotifications ?? true)
        setEmailNotifications(p.emailNotifications ?? true)
      } catch { /* ignore */ }
    }
    setTwoFactorEnabled(localStorage.getItem("customer-2fa") === "true")
    setLoaded(true)
  }, [])

  const saveSetting = (key: string, value: boolean) => {
    const current = JSON.parse(localStorage.getItem("customer-profile-settings") || "{}")
    const next = { ...current, [key]: value }
    localStorage.setItem("customer-profile-settings", JSON.stringify(next))
  }

  const initials = (session?.user?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"

  const handleSave = async () => {
    setSaving(true)
    const formData = new FormData()
    formData.set("name", name)
    formData.set("phone", phone)
    const result = await updateProfileAction(null, formData)
    setSaving(false)
    if (result.success) toast.success("Profile updated")
    else toast.error(result.error || "Failed to update profile")
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setChangingPassword(true)
    const formData = new FormData()
    formData.set("currentPassword", currentPassword)
    formData.set("newPassword", newPassword)
    const result = await changePasswordAction(null, formData)
    setChangingPassword(false)
    if (result.success) {
      toast.success("Password changed")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else toast.error(result.error || "Failed to change password")
  }

  const handle2FAChange = () => {
    if (twoFactorEnabled) {
      setShow2FADialog(true)
    } else {
      setPending2FA(true)
      setTimeout(() => {
        setTwoFactorEnabled(true)
        localStorage.setItem("customer-2fa", "true")
        setPending2FA(false)
        toast.success("Two-factor authentication enabled")
      }, 800)
    }
  }

  const confirmDisable2FA = () => {
    setTwoFactorEnabled(false)
    localStorage.setItem("customer-2fa", "false")
    setShow2FADialog(false)
    toast.success("Two-factor authentication disabled")
  }

  const handleDarkMode = (v: boolean) => {
    setDarkMode(v)
    saveSetting("darkMode", v)
    document.documentElement.classList.toggle("dark", v)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Profile" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Orders</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                        <Eye className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats?.activeOrders || 0}</p>
                        <p className="text-xs text-muted-foreground">Active Orders</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatCurrency(stats?.totalSpent || 0)}</p>
                        <p className="text-xs text-muted-foreground">Total Spent</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats?.pagesPrinted || 0}</p>
                        <p className="text-xs text-muted-foreground">Pages Printed</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="profile">
                  <TabsList>
                    <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
                    <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="mt-6">
                    <Card>
                      <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-lg">{name || "Your Name"}</p>
                            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                          <Input label="Email" type="email" value={session?.user?.email || ""} disabled />
                          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                        </div>
                        <Button onClick={handleSave} loading={saving}>
                          <CheckCircle className="h-4 w-4" /> Save Changes
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security" className="mt-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                      <div className="lg:col-span-2 space-y-6">
                        <Card>
                          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                              <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                            <Button onClick={handleChangePassword} loading={changingPassword}>
                              <Key className="h-4 w-4" /> Change Password
                            </Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${twoFactorEnabled ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                                  <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-medium">Two-Factor Authentication</p>
                                  <p className="text-sm text-muted-foreground">
                                    {twoFactorEnabled
                                      ? "Your account is secured with 2FA"
                                      : "Add an extra layer of security to your account"}
                                  </p>
                                </div>
                              </div>
                              <Switch checked={twoFactorEnabled} onCheckedChange={handle2FAChange} disabled={pending2FA} />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Security Tips</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">Use a strong, unique password</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className={`h-4 w-4 mt-0.5 shrink-0 ${twoFactorEnabled ? "text-emerald-500" : "text-muted-foreground"}`} />
                              <span className="text-muted-foreground">Enable two-factor authentication</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">Use a password manager</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notifications" className="mt-6">
                    <Card>
                      <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/20 transition-colors">
                          <div>
                            <p className="font-medium">Order updates via email</p>
                            <p className="text-sm text-muted-foreground">Receive order status updates</p>
                          </div>
                          <Switch checked={emailNotifications} onCheckedChange={(v) => { setEmailNotifications(v); saveSetting("emailNotifications", v) }} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/20 transition-colors">
                          <div>
                            <p className="font-medium">Push notifications</p>
                            <p className="text-sm text-muted-foreground">Receive real-time order alerts</p>
                          </div>
                          <Switch checked={pushNotifications} onCheckedChange={(v) => { setPushNotifications(v); saveSetting("pushNotifications", v) }} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/20 transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">Language</p>
                            </div>
                            <p className="text-sm text-muted-foreground">English (India)</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/20 transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">Dark Mode</p>
                            </div>
                            <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                          </div>
                          <Switch checked={darkMode} onCheckedChange={handleDarkMode} disabled={!loaded} />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}

            <Card className="mt-6 border-destructive/50">
              <CardHeader><CardTitle className="text-destructive">Delete Account</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">This action is irreversible. All your data will be permanently deleted.</p>
                <Button variant="destructive" className="gap-2" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4" /> Delete Account
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication?</DialogTitle>
            <DialogDescription>This will make your account less secure. Are you sure?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShow2FADialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDisable2FA}>Yes, Disable 2FA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>This action is irreversible. All your data will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" disabled>Confirm Deletion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
