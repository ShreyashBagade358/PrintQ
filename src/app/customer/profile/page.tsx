"use client"

import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { User, Shield, Bell, Trash2 } from "lucide-react"

export default function CustomerProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Profile" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
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
                    <Avatar className="h-16 w-16"><AvatarFallback className="text-lg">JD</AvatarFallback></Avatar>
                    <Button variant="outline" size="sm">Change Photo</Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Full Name" defaultValue="John Doe" />
                    <Input label="Email" type="email" defaultValue="john@example.com" />
                    <Input label="Phone" defaultValue="+91 98765 43210" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input label="Current Password" type="password" />
                  <Input label="New Password" type="password" />
                  <Input label="Confirm Password" type="password" />
                  <Button>Change Password</Button>
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

          <Card className="mt-6 border-destructive/50">
            <CardHeader><CardTitle className="text-destructive">Delete Account</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">This action is irreversible. All your data will be permanently deleted.</p>
              <Button variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" /> Delete My Account</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
