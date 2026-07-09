"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"
import { getProfileAction, updateProfileAction, changePasswordAction } from "@/lib/actions/profile.actions"
import { getShopAction, updateShopAction, getShopProfileStatsAction } from "@/lib/actions/shop.actions"
import { toast } from "sonner"
import {
  User, Shield, Bell, Trash2, Loader2, CheckCircle, Store,
  Key, LogOut, Smartphone, Laptop, Camera, Eye, EyeOff,
  Monitor, Verified, BadgeCheck, ShieldCheck, AlertTriangle,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Prisma } from "@prisma/client"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

type ShopData = Prisma.ShopGetPayload<{
  include: {
    subscriptions: { include: { plan: true } }
    printers: true
    staff: true
  }
}>

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

export default function ProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [shop, setShop] = useState<ShopData | null>(null)
  const [stats, setStats] = useState<{ totalOrders: number; totalSpent: number } | null>(null)
  const [memberSince, setMemberSince] = useState("")

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [altPhone, setAltPhone] = useState("")
  const [shopName, setShopName] = useState("")
  const [shopAddress, setShopAddress] = useState("")
  const [shopCity, setShopCity] = useState("")
  const [shopState, setShopState] = useState("")
  const [shopPinCode, setShopPinCode] = useState("")
  const [shopEmail, setShopEmail] = useState("")
  const [shopPhone, setShopPhone] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)

  const [passChecked, setPassChecked] = useState({ len: false, upper: false, num: false, special: false })

  const [sessions, setSessions] = useState<Array<{ device: string; browser: string; location: string; time: string; current: boolean }>>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const savedSessions = localStorage.getItem("shop-sessions")
    if (savedSessions) {
      try { setSessions(JSON.parse(savedSessions)) } catch { /* ignore */ }
    } else {
      const entry = { device: navigator.platform || "Unknown", browser: getBrowser(), location: "Pune, Maharashtra", time: "Today 10:15 AM", current: true }
      setSessions([entry, { device: "Android", browser: "Chrome", location: "Mumbai, Maharashtra", time: "Yesterday", current: false }])
      localStorage.setItem("shop-sessions", JSON.stringify([entry]))
    }
    setTwoFactorEnabled(localStorage.getItem("shop-2fa") === "true")
  }, [])

  useEffect(() => {
    Promise.all([getProfileAction(), getShopAction(), getShopProfileStatsAction()]).then(([profile, shopData, statsData]) => {
      if (profile?.user) {
        setName(profile.user.name)
        setPhone(profile.user.phone || "")
        if (profile.user.createdAt) setMemberSince(new Date(profile.user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }))
      }
      if (shopData) {
        const s = shopData as unknown as ShopData
        setShop(s)
        setShopName(s.name)
        setShopAddress(s.address)
        setShopCity(s.city)
        setShopState(s.state)
        setShopPinCode(s.pinCode)
        setShopEmail(s.email)
        setShopPhone(s.phone)
      }
      if (statsData) setStats(statsData as { totalOrders: number; totalSpent: number })
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

  function getBrowser() {
    const ua = navigator.userAgent
    if (ua.includes("Chrome")) return "Chrome"
    if (ua.includes("Firefox")) return "Firefox"
    if (ua.includes("Safari")) return "Safari"
    if (ua.includes("Edge")) return "Edge"
    return "Browser"
  }

  const initials = (session?.user?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"

  const handleSaveProfile = async () => {
    setSaving(true)
    const pForm = new FormData()
    pForm.set("name", name)
    pForm.set("phone", phone)
    const pResult = await updateProfileAction(null, pForm)
    if (pResult.success && shop) {
      const sForm = new FormData()
      sForm.set("name", shopName)
      sForm.set("address", shopAddress)
      sForm.set("city", shopCity)
      sForm.set("state", shopState)
      sForm.set("pinCode", shopPinCode)
      sForm.set("email", shopEmail)
      sForm.set("phone", shopPhone)
      await updateShopAction(null, sForm)
    }
    setSaving(false)
    if (pResult.success) toast.success("Profile updated successfully")
    else toast.error(pResult.error || "Failed to update profile")
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
      toast.success("Password changed successfully")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } else toast.error(result.error || "Failed to change password")
  }

  const handleRevokeSession = (index: number) => {
    const updated = sessions.filter((_, i) => i !== index)
    setSessions(updated)
    localStorage.setItem("shop-sessions", JSON.stringify(updated))
    toast.success("Session revoked")
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar title="Profile" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-8 ml-16 lg:ml-64">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">

              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your personal information and account security.</p>
              </div>

              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto gap-0">
                  {["Profile Information", "Security", "Notifications", "Sessions", "Danger Zone"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab.toLowerCase().replace(/\s+/g, "-")}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="profile-information" className="mt-6">
                  <div className="grid grid-cols-12 gap-6">

                    {/* --- Left Column (46%) --- */}
                    <div className="col-span-12 lg:col-span-6 xl:col-span-5">
                      <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">

                          {/* Avatar Section */}
                          <div className="flex flex-col items-center">
                            <div className="relative inline-block">
                              <Avatar className="h-28 w-28 ring-2 ring-primary/10">
                                <AvatarFallback className="text-3xl font-semibold">{initials}</AvatarFallback>
                              </Avatar>
                              <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md border border-border hover:bg-gray-50 transition-colors">
                                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            </div>
                            <p className="text-base font-semibold mt-3">{name || "Your Name"}</p>
                            <p className="text-xs text-muted-foreground mt-1.5">Owner</p>
                            <div className="flex items-center gap-1 mt-1.5">
                              <BadgeCheck className="h-4 w-4 text-[#2563EB]" />
                              <span className="text-xs text-[#2563EB] font-medium">Verified</span>
                            </div>
                          </div>

                          {/* Form */}
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                              <Input label="Email Address" type="email" value={session?.user?.email || ""} disabled />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                              <Input label="Alternate Phone" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} placeholder="+91 98765 43210" />
                            </div>
                            <Input label="Shop Name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
                            <Textarea label="Shop Address" value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} placeholder="Street address" className="min-h-[60px]" />
                            <div className="grid grid-cols-3 gap-4">
                              <Input label="City" value={shopCity} onChange={(e) => setShopCity(e.target.value)} />
                              <Input label="State" value={shopState} onChange={(e) => setShopState(e.target.value)} />
                              <Input label="Pincode" value={shopPinCode} onChange={(e) => setShopPinCode(e.target.value)} />
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <Button onClick={handleSaveProfile} loading={saving} className="px-6 bg-[#2563EB] hover:bg-[#2563EB]/90">
                              <CheckCircle className="h-4 w-4" /> Save Changes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* --- Middle Column (30%) --- */}
                    <div className="col-span-12 lg:col-span-6 xl:col-span-4 space-y-6">

                      {/* Change Password */}
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

                      {/* Active Sessions */}
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

                    {/* --- Right Column (24%) --- */}
                    <div className="col-span-12 xl:col-span-3 space-y-6">

                      {/* Two-Factor Auth */}
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
                                localStorage.setItem("shop-2fa", "true")
                                toast.success("Two-factor authentication enabled")
                              }
                            }}
                          >
                            {twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Account Summary */}
                      <Card className="rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] border-[#E5E7EB]">
                        <CardHeader>
                          <CardTitle className="text-base font-semibold">Account Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[
                            { label: "Account Type", value: "Professional" },
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

                      {/* Delete Account */}
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
                </TabsContent>
              </Tabs>
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
            <Button variant="destructive" onClick={() => { setTwoFactorEnabled(false); localStorage.setItem("shop-2fa", "false"); setShow2FADialog(false); toast.success("Two-factor authentication disabled") }}>Yes, Disable 2FA</Button>
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
