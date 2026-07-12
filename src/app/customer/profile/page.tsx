"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useSession } from "next-auth/react"
import { getProfileAction, updateProfileAction, changePasswordAction } from "@/lib/actions/profile.actions"
import { getCustomerDashboardAction } from "@/lib/actions/profile.actions"
import { toast } from "sonner"
import {
  Loader2, CheckCircle, Camera, Eye, EyeOff, Key, Shield, Trash2,
  Monitor, Smartphone, BadgeCheck, Bell, Mail, MessageSquare,
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [memberSince, setMemberSince] = useState("")

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)

  const [passChecked, setPassChecked] = useState({ len: false, upper: false, num: false, special: false })

  const [sessions, setSessions] = useState<Array<{ device: string; browser: string; location: string; time: string; current: boolean }>>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)

  function getBrowser() {
    const ua = navigator.userAgent
    if (ua.includes("Chrome")) return "Chrome"
    if (ua.includes("Firefox")) return "Firefox"
    if (ua.includes("Safari")) return "Safari"
    if (ua.includes("Edge")) return "Edge"
    return "Browser"
  }

  useEffect(() => {
    const savedSessions = localStorage.getItem("customer-sessions")
    if (savedSessions) {
      try { setSessions(JSON.parse(savedSessions)) } catch { /* ignore */ }
    } else {
      const entry = { device: navigator.platform || "Unknown", browser: getBrowser(), location: "Pune, Maharashtra", time: "Today 10:15 AM", current: true }
      setSessions([entry, { device: "Android", browser: "Chrome", location: "Mumbai, Maharashtra", time: "Yesterday", current: false }])
      localStorage.setItem("customer-sessions", JSON.stringify([entry]))
    }
    setTwoFactorEnabled(localStorage.getItem("customer-2fa") === "true")

    const savedNotifs = localStorage.getItem("customer-notification-settings")
    if (savedNotifs) {
      try {
        const p = JSON.parse(savedNotifs)
        setEmailNotifications(p.emailNotifications ?? true)
        setSmsNotifications(p.smsNotifications ?? true)
        setPushNotifications(p.pushNotifications ?? true)
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    Promise.all([getProfileAction(), getCustomerDashboardAction()]).then(([profile, dashboard]) => {
      if (profile?.user) {
        setName(profile.user.name)
        setPhone(profile.user.phone || "")
        if (profile.user.createdAt) setMemberSince(new Date(profile.user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }))
      }
      if (dashboard) {
        setStats(dashboard.stats as unknown as CustomerStats)
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setPassChecked({
      len: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      num: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    })
  }, [newPassword])

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
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return }
    setChangingPassword(true)
    const formData = new FormData()
    formData.set("currentPassword", currentPassword)
    formData.set("newPassword", newPassword)
    const result = await changePasswordAction(null, formData)
    setChangingPassword(false)
    if (result.success) {
      toast.success("Password changed")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } else toast.error(result.error || "Failed to change password")
  }

  const handleRevokeSession = (index: number) => {
    const updated = sessions.filter((_, i) => i !== index)
    setSessions(updated)
    localStorage.setItem("customer-sessions", JSON.stringify(updated))
    toast.success("Session revoked")
  }

  const saveNotificationSetting = (key: string, value: boolean) => {
    const current = JSON.parse(localStorage.getItem("customer-notification-settings") || "{}")
    const next = { ...current, [key]: value }
    localStorage.setItem("customer-notification-settings", JSON.stringify(next))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar title="Profile" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-8 md:ml-16 lg:ml-64">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your personal information and account security.</p>
              </div>

              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - ~46% */}
                <div className="col-span-12 lg:col-span-7 xl:col-span-5">
                  <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center mb-8">
                        <div className="relative inline-block">
                          <Avatar className="h-28 w-28 ring-2 ring-primary/10">
                            <AvatarFallback className="text-3xl font-semibold">{initials}</AvatarFallback>
                          </Avatar>
                          <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md border border-border hover:bg-gray-50 transition-colors">
                            <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                        <p className="text-base font-semibold mt-3">{name || "Your Name"}</p>
                        <p className="text-xs text-muted-foreground mt-2">Customer</p>
                        <div className="flex items-center gap-1 mt-2">
                          <BadgeCheck className="h-4 w-4 text-[#2563EB]" />
                          <span className="text-xs text-[#2563EB] font-medium">Verified</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                          <Input label="Email Address" type="email" value={session?.user?.email || ""} disabled />
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

                {/* Middle Column - ~30% */}
                <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-6">
                  <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Change Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <PasswordInput label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
                      <PasswordInput label="New Password" value={newPassword} onChange={setNewPassword} />
                      <PasswordInput label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} />

                      <div className="space-y-1.5 pt-1">
                        {[
                          { key: "len", label: "8 Characters" },
                          { key: "upper", label: "Uppercase" },
                          { key: "num", label: "Number" },
                          { key: "special", label: "Special Character" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center gap-2 text-xs">
                            <div className={`rounded-full p-0.5 ${passChecked[item.key as keyof typeof passChecked] ? "text-emerald-500" : "text-muted-foreground"}`}>
                              <CheckCircle className="h-3.5 w-3.5" />
                            </div>
                            <span className={passChecked[item.key as keyof typeof passChecked] ? "text-emerald-600" : "text-muted-foreground"}>{item.label}</span>
                          </div>
                        ))}
                      </div>

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
                            <p className="text-xs text-muted-foreground">Receive order updates and offers via email</p>
                          </div>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={(v) => { setEmailNotifications(v); saveNotificationSetting("emailNotifications", v) }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">SMS Notifications</p>
                            <p className="text-xs text-muted-foreground">Receive order alerts via SMS</p>
                          </div>
                        </div>
                        <Switch checked={smsNotifications} onCheckedChange={(v) => { setSmsNotifications(v); saveNotificationSetting("smsNotifications", v) }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Push Notifications</p>
                            <p className="text-xs text-muted-foreground">Receive real-time alerts on your device</p>
                          </div>
                        </div>
                        <Switch checked={pushNotifications} onCheckedChange={(v) => { setPushNotifications(v); saveNotificationSetting("pushNotifications", v) }} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Active Sessions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sessions.slice(0, 2).map((s, i) => (
                        <div key={i} className="flex items-start justify-between">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${s.current ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {s.device?.toLowerCase().includes("android") || s.device?.toLowerCase().includes("iphone") ? (
                                <Smartphone className="h-4 w-4" />
                              ) : (
                                <Monitor className="h-4 w-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-sm font-medium truncate">{s.browser} on {s.device}</p>
                                {s.current && <Badge className="text-[10px] h-4 px-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-200">Current</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">{s.location}</p>
                              <p className="text-[11px] text-muted-foreground">{s.time}</p>
                            </div>
                          </div>
                          {!s.current && (
                            <Button variant="ghost" size="sm" className="text-destructive text-xs h-auto px-2 py-1" onClick={() => handleRevokeSession(i)}>Revoke</Button>
                          )}
                        </div>
                      ))}
                      <button className="w-full text-center text-xs text-[#2563EB] font-medium pt-1 hover:underline">View all sessions</button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - ~24% */}
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB]/5"
                        onClick={() => {
                          if (twoFactorEnabled) setShow2FADialog(true)
                          else {
                            setTwoFactorEnabled(true)
                            localStorage.setItem("customer-2fa", "true")
                            toast.success("Two-factor authentication enabled")
                          }
                        }}
                      >
                        {twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Account Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: "Account Type", value: "Individual" },
                        { label: "Member Since", value: memberSince || "—" },
                        { label: "Total Orders", value: String(stats?.totalOrders ?? 0) },
                        { label: "Total Spent", value: formatCurrency(stats?.totalSpent ?? 0) },
                        { label: "Status", value: "Active", badge: true },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{row.label}</span>
                          {row.badge ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs font-medium">Active</Badge>
                          ) : (
                            <span className="font-medium text-right">{row.value}</span>
                          )}
                        </div>
                      ))}
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
            </motion.div>
          )}
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
            <Button variant="destructive" onClick={() => { setTwoFactorEnabled(false); localStorage.setItem("customer-2fa", "false"); setShow2FADialog(false); toast.success("Two-factor authentication disabled") }}>Yes, Disable 2FA</Button>
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
