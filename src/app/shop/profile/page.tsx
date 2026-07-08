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
import { useSession } from "next-auth/react"
import { getProfileAction, updateProfileAction, changePasswordAction } from "@/lib/actions/profile.actions"
import { toast } from "sonner"
import { User, Shield, Bell, Eye, Trash2, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
