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
import { useSession } from "next-auth/react"
import { getProfileAction, updateProfileAction, changePasswordAction } from "@/lib/actions/profile.actions"
import { getShopAction } from "@/lib/actions/shop.actions"
import { toast } from "sonner"
import { User, Shield, Bell, Eye, Trash2, Loader2, CreditCard, Receipt, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Prisma } from "@prisma/client"

type ShopWithBilling = Prisma.ShopGetPayload<{
  include: { subscriptions: { include: { plan: true } } }
}>

export default function ProfilePage() {
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [shop, setShop] = useState<ShopWithBilling | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    getProfileAction().then((result) => {
      if (result?.user) {
        setName(result.user.name)
        setPhone(result.user.phone || "")
      }
      setLoading(false)
    })
  }, [])

  const loadBilling = async () => {
    setBillingLoading(true)
    const result = await getShopAction()
    if (result) setShop(result as unknown as ShopWithBilling)
    setBillingLoading(false)
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
                <TabsList>
                  <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
                  <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
                  <TabsTrigger value="billing" className="gap-2" onClick={loadBilling}><CreditCard className="h-4 w-4" /> Billing</TabsTrigger>
                  <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
                  <TabsTrigger value="sessions" className="gap-2"><Eye className="h-4 w-4" /> Sessions</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <Card>
                    <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" disabled>Change Photo</Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                        <Input label="Email" type="email" value={session?.user?.email || ""} disabled />
                        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                      </div>
                      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card>
                    <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <Button onClick={handleChangePassword} loading={changingPassword}>Change Password</Button>
                      </div>
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="billing">
                  <Card>
                    <CardHeader><CardTitle>Subscription & Billing</CardTitle></CardHeader>
                    <CardContent>
                      {billingLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                      ) : shop?.subscriptions?.[0] ? (
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
                                {(shop.subscriptions[0].plan.features as string[]).map((f: string) => (
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
                              <CreditCard className="h-8 w-8 text-primary" />
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
                      {["Email notifications", "Push notifications", "SMS alerts", "Weekly digest"].map((item) => (
                        <div key={item} className="flex items-center justify-between">
                          <span className="font-medium">{item}</span>
                          <Switch defaultChecked />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sessions">
                  <Card>
                    <CardHeader><CardTitle>Active Sessions</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { device: "Chrome on macOS", location: "Gurugram, India", time: "Active now" },
                        { device: "Safari on iPhone", location: "Delhi, India", time: "2 hours ago" },
                      ].map((s) => (
                        <div key={s.device} className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="font-medium">{s.device}</p>
                            <p className="text-sm text-muted-foreground">{s.location} &bull; {s.time}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-destructive">Revoke</Button>
                        </div>
                      ))}
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
                <Button variant="destructive" className="gap-2" disabled>
                  <Trash2 className="h-4 w-4" /> Delete Account
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
