"use client"

import { useState, useEffect } from "react"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useSession } from "next-auth/react"
import { getProfileAction, updateProfileAction, changePasswordAction } from "@/lib/actions/profile.actions"
import { toast } from "sonner"
import { User, Shield, Bell, Trash2, Loader2 } from "lucide-react"

export default function CustomerProfilePage() {
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
      <DashboardNavbar title="Profile" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
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
                      <Avatar className="h-16 w-16"><AvatarFallback className="text-lg">{initials}</AvatarFallback></Avatar>
                      <Button variant="outline" size="sm" disabled>Change Photo</Button>
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

              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <Button onClick={handleChangePassword} loading={changingPassword}>Change Password</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {["Order updates via email", "Order updates via SMS", "Marketing emails"].map((item) => (
                      <div key={item} className="flex items-center justify-between">
                        <span>{item}</span>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <Card className="mt-6 border-destructive/50">
            <CardHeader><CardTitle className="text-destructive">Delete Account</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">This action is irreversible. All your data will be permanently deleted.</p>
              <Button variant="destructive" className="gap-2" disabled><Trash2 className="h-4 w-4" /> Delete My Account</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
