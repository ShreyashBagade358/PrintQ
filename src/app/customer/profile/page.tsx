"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { useSession } from "next-auth/react"
import { getProfileAction, updateProfileAction, changePasswordAction } from "@/lib/actions/profile.actions"
import { getCustomerDashboardAction } from "@/lib/actions/profile.actions"
import { toast } from "sonner"
import {
  Shield, Bell, Trash2, Loader2, Package, CreditCard, FileText, CheckCircle,
  Key, Eye, EyeOff, Mail,
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

function PasswordInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        label={label}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground mt-4"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar title="Profile" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-8 ml-16 lg:ml-64">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                  <p className="text-sm text-muted-foreground mt-1">Manage your personal information and account settings.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
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
                  <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
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
                  <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
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
                  <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
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

                <div className="grid grid-cols-12 gap-6">
                  {/* Left Column */}
                  <div className="col-span-12 lg:col-span-7 xl:col-span-5">
                    <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
                      <CardHeader className="pb-0">
                        <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center mb-8">
                          <Avatar className="h-20 w-20 ring-2 ring-primary/10">
                            <AvatarFallback className="text-2xl font-semibold">{initials}</AvatarFallback>
                          </Avatar>
                          <p className="text-base font-semibold mt-3">{name || "Your Name"}</p>
                          <p className="text-xs text-muted-foreground mt-1">{session?.user?.email}</p>
                        </div>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                            <Input label="Email" type="email" value={session?.user?.email || ""} disabled />
                          </div>
                          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                        </div>
                        <div className="flex justify-end mt-6">
                          <Button onClick={handleSave} loading={saving} className="px-6 bg-[#2563EB] hover:bg-[#2563EB]/90">
                            <CheckCircle className="h-4 w-4" /> Save Changes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Middle Column */}
                  <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-6">
                    <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">Change Password</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <PasswordInput label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
                        <PasswordInput label="New Password" value={newPassword} onChange={setNewPassword} />
                        <PasswordInput label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} />
                        <div className="flex justify-end pt-1">
                          <Button onClick={handleChangePassword} loading={changingPassword} variant="outline" className="px-5">
                            <Key className="h-4 w-4" /> Update Password
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">Notification Preferences</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <Mail className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Email Notifications</p>
                              <p className="text-xs text-muted-foreground">Receive order updates via email</p>
                            </div>
                          </div>
                          <Switch checked={emailNotifications} onCheckedChange={(v) => { setEmailNotifications(v); saveSetting("emailNotifications", v) }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <Bell className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Push Notifications</p>
                              <p className="text-xs text-muted-foreground">Receive real-time order alerts</p>
                            </div>
                          </div>
                          <Switch checked={pushNotifications} onCheckedChange={(v) => { setPushNotifications(v); saveSetting("pushNotifications", v) }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <Eye className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Dark Mode</p>
                              <p className="text-xs text-muted-foreground">Toggle dark theme</p>
                            </div>
                          </div>
                          <Switch checked={darkMode} onCheckedChange={handleDarkMode} disabled={!loaded} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column */}
                  <div className="col-span-12 xl:col-span-3 space-y-5">
                    <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
                      <CardContent className="flex flex-col items-center py-6 px-6">
                        <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                          <Shield className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-semibold text-center">Two-factor authentication is {twoFactorEnabled ? "enabled" : "disabled"}</p>
                        <p className="text-xs text-muted-foreground text-center mt-1.5">
                          {twoFactorEnabled ? "Your account is protected with 2FA." : "Add extra security to your account."}
                        </p>
                        <Switch checked={twoFactorEnabled} onCheckedChange={handle2FAChange} disabled={pending2FA} className="mt-4" />
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold text-destructive">Delete Account</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
                        <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/5" onClick={() => setShowDeleteDialog(true)}>
                          <Trash2 className="h-4 w-4" /> Delete My Account
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}

            <Card className="mt-6 rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-destructive/50 hidden">
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
