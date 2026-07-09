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
import { getShopAction, updateShopAction } from "@/lib/actions/shop.actions"
import { toast } from "sonner"
import {
  User, Shield, Bell, Trash2, Loader2, CreditCard, Receipt, CheckCircle, ArrowRight,
  Store, Globe, Clock, Printer, Users, Package,
  Key, LogOut, Smartphone, Laptop,
} from "lucide-react"
import Link from "next/link"
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

const notificationsConfig = [
  { key: "emailOrders", label: "Email notifications", desc: "New orders & updates via email" },
  { key: "pushOrders", label: "Push notifications", desc: "Real-time alerts on desktop" },
  { key: "smsAlerts", label: "SMS alerts", desc: "Urgent order alerts via SMS" },
  { key: "weeklyDigest", label: "Weekly digest", desc: "Weekly performance summary" },
  { key: "marketing", label: "Marketing emails", desc: "Tips, promotions & updates" },
]

export default function ProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [shop, setShop] = useState<ShopData | null>(null)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [shopName, setShopName] = useState("")
  const [shopAddress, setShopAddress] = useState("")
  const [shopCity, setShopCity] = useState("")
  const [shopState, setShopState] = useState("")
  const [shopPinCode, setShopPinCode] = useState("")
  const [shopEmail, setShopEmail] = useState("")
  const [shopPhone, setShopPhone] = useState("")
  const [shopTimezone, setShopTimezone] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    emailOrders: true, pushOrders: true, smsAlerts: false, weeklyDigest: true, marketing: false,
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [pending2FA, setPending2FA] = useState(false)

  const [sessions, setSessions] = useState<Array<{ device: string; browser: string; location: string; time: string; ip: string; current: boolean }>>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const savedNotifs = localStorage.getItem("shop-notifications")
    if (savedNotifs) {
      try { setNotifications(prev => ({ ...prev, ...JSON.parse(savedNotifs) })) } catch { /* ignore */ }
    }

    const savedSessions = localStorage.getItem("shop-sessions")
    if (savedSessions) {
      try { setSessions(JSON.parse(savedSessions)) } catch { /* ignore */ }
    } else {
      const entry = {
        device: navigator.platform || "Unknown",
        browser: getBrowser(),
        location: "India",
        time: "Active now",
        ip: "127.0.0.1",
        current: true,
      }
      setSessions([entry])
      localStorage.setItem("shop-sessions", JSON.stringify([entry]))
    }

    const tfa = localStorage.getItem("shop-2fa") === "true"
    setTwoFactorEnabled(tfa)
  }, [])

  useEffect(() => {
    Promise.all([getProfileAction(), getShopAction()]).then(([profile, shopData]) => {
      if (profile?.user) {
        setName(profile.user.name)
        setPhone(profile.user.phone || "")
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
        setShopTimezone(s.timezone || "Asia/Kolkata")
      }
      setLoading(false)
    })
  }, [])

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
      sForm.set("timezone", shopTimezone)
      await updateShopAction(null, sForm)
    }
    setSaving(false)
    if (pResult.success) toast.success("Profile updated")
    else toast.error(pResult.error || "Failed to update profile")
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

  const handleNotificationChange = (key: string, value: boolean) => {
    const next = { ...notifications, [key]: value }
    setNotifications(next)
    localStorage.setItem("shop-notifications", JSON.stringify(next))
  }

  const handle2FAChange = () => {
    if (twoFactorEnabled) {
      setShow2FADialog(true)
    } else {
      setPending2FA(true)
      setTimeout(() => {
        setTwoFactorEnabled(true)
        localStorage.setItem("shop-2fa", "true")
        setPending2FA(false)
        toast.success("Two-factor authentication enabled")
      }, 800)
    }
  }

  const confirmDisable2FA = () => {
    setTwoFactorEnabled(false)
    localStorage.setItem("shop-2fa", "false")
    setShow2FADialog(false)
    toast.success("Two-factor authentication disabled")
  }

  const handleRevokeSession = (index: number) => {
    const updated = sessions.filter((_, i) => i !== index)
    setSessions(updated)
    localStorage.setItem("shop-sessions", JSON.stringify(updated))
    toast.success("Session revoked")
  }

  const completionPercent = [
    !!name, !!phone, !!shopName, !!shopAddress, !!shopCity,
    !!shopState, !!shopPinCode, !!shopEmail, !!shopPhone,
  ].filter(Boolean).length / 9 * 100

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Profile" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="flex-wrap">
                  <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
                  <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
                  <TabsTrigger value="billing" className="gap-2"><CreditCard className="h-4 w-4" /> Billing</TabsTrigger>
                  <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
                  <TabsTrigger value="sessions" className="gap-2"><LogOut className="h-4 w-4" /> Sessions</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                      <Card>
                        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 ring-2 ring-primary/10">
                              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-lg">{name || "Your Name"}</p>
                              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Shop Owner</p>
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                            <Input label="Email" type="email" value={session?.user?.email || ""} disabled />
                            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>Shop Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="Shop Name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
                            <Input label="Shop Email" value={shopEmail} onChange={(e) => setShopEmail(e.target.value)} />
                            <Input label="Shop Phone" value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} placeholder="+91 98765 43210" />
                            <Input label="Timezone" value={shopTimezone} onChange={(e) => setShopTimezone(e.target.value)} />
                          </div>
                          <Textarea label="Address" value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} placeholder="Street address" />
                          <div className="grid gap-4 sm:grid-cols-3">
                            <Input label="City" value={shopCity} onChange={(e) => setShopCity(e.target.value)} />
                            <Input label="State" value={shopState} onChange={(e) => setShopState(e.target.value)} />
                            <Input label="PIN Code" value={shopPinCode} onChange={(e) => setShopPinCode(e.target.value)} />
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex gap-3">
                        <Button onClick={handleSaveProfile} loading={saving} size="lg" className="px-8">
                          <CheckCircle className="h-4 w-4" /> Save Changes
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Profile Completion</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.round(completionPercent)}%` }}
                                className="h-full bg-primary rounded-full"
                              />
                            </div>
                            <span className="text-sm font-bold">{Math.round(completionPercent)}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Fill in all fields to complete your profile</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="text-sm">Staff</span>
                            </div>
                            <span className="font-bold">{shop?.staff?.length || 0}</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Printer className="h-4 w-4 text-primary" />
                              <span className="text-sm">Printers</span>
                            </div>
                            <span className="font-bold">{shop?.printers?.length || 0}</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-primary" />
                              <span className="text-sm">Slug</span>
                            </div>
                            <span className="font-bold text-xs font-mono">{shop?.slug || "—"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-primary" />
                              <span className="text-sm">Plan</span>
                            </div>
                            <span className="font-bold text-sm">{shop?.subscriptions?.[0]?.plan?.name || "Free"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security">
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                      <Card>
                        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                          </div>
                          <Button onClick={handleChangePassword} loading={changingPassword}>
                            <Shield className="h-4 w-4" /> Change Password
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
                            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">Regularly review active sessions</span>
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

                <TabsContent value="billing">
                  <Card>
                    <CardHeader><CardTitle>Subscription & Billing</CardTitle></CardHeader>
                    <CardContent>
                      {shop?.subscriptions?.[0] ? (
                        <div className="space-y-6">
                          <div className="flex items-start justify-between rounded-xl border p-5">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold">{shop.subscriptions[0].plan.name}</h3>
                                <Badge variant="success">Active</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatCurrency(shop.subscriptions[0].plan.price)}/month
                              </p>
                              <ul className="mt-4 space-y-2">
                                {(shop.subscriptions[0].plan.features as string[]).map((f) => (
                                  <li key={f} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <Link href="/shop/subscription">
                              <Button variant="outline" size="sm" className="gap-2">
                                Change Plan <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>

                          <div className="rounded-xl border p-5">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-primary" /> Payment Method
                            </h4>
                            <div className="flex items-center gap-3 rounded-lg border p-4">
                              <div className="h-10 w-14 shrink-0 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                                VISA
                              </div>
                              <div>
                                <p className="font-medium">Visa ending in 4242</p>
                                <p className="text-sm text-muted-foreground">Expires 12/26</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-xl border p-5">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-primary" /> Invoice History
                            </h4>
                            <div className="space-y-2">
                              {[
                                { id: "INV-2025-001", date: "Jan 15, 2025", amount: formatCurrency(shop.subscriptions[0].plan.price), status: "paid" },
                                { id: "INV-2025-002", date: "Dec 15, 2024", amount: formatCurrency(shop.subscriptions[0].plan.price), status: "paid" },
                                { id: "INV-2025-003", date: "Nov 15, 2024", amount: formatCurrency(shop.subscriptions[0].plan.price), status: "paid" },
                              ].map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                                  <div className="flex items-center gap-3">
                                    <Receipt className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">{inv.id}</p>
                                      <p className="text-xs text-muted-foreground">{inv.date}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">{inv.amount}</span>
                                    <Badge variant="success">paid</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="font-medium">No active subscription</p>
                          <p className="text-sm mt-1">Choose a plan to get started.</p>
                          <Link href="/shop/subscription">
                            <Button className="mt-4 gap-2">View Plans <ArrowRight className="h-4 w-4" /></Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications">
                  <Card>
                    <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {notificationsConfig.map((item) => (
                        <div key={item.key}
                          className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/20 transition-colors">
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                          <Switch
                            checked={notifications[item.key]}
                            onCheckedChange={(v) => handleNotificationChange(item.key, v)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sessions">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Active Sessions</CardTitle>
                        <Badge variant="secondary">{sessions.length} active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sessions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="font-medium">No active sessions</p>
                        </div>
                      ) : (
                        sessions.map((s, i) => (
                          <div key={i}
                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/20 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${s.current ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {s.device?.toLowerCase().includes("iphone") || s.device?.toLowerCase().includes("android") ? (
                                  <Smartphone className="h-5 w-5" />
                                ) : (
                                  <Laptop className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{s.browser} on {s.device}</p>
                                  {s.current && <Badge variant="success" className="text-[10px]">Current</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">{s.location} &bull; {s.time}</p>
                                <p className="text-xs text-muted-foreground">IP: {s.ip}</p>
                              </div>
                            </div>
                            {!s.current && (
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRevokeSession(i)}>
                                Revoke
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            <Card className="mt-6 border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
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
            <DialogDescription>
              This will make your account less secure. Are you sure you want to continue?
            </DialogDescription>
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
            <DialogDescription>
              This action is irreversible. All your data, orders, customers, and settings will be permanently deleted.
            </DialogDescription>
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
