"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Save, Upload, Shield, Bell, Eye } from "lucide-react"

export default function ShopSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Settings" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Shop Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Shop Name" defaultValue="PrintPro Delhi" />
                      <Input label="Email" defaultValue="shop@printpro.com" />
                    </div>
                    <Input label="Address" defaultValue="42, Sector 14, Gurugram" />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Input label="City" defaultValue="Gurugram" />
                      <Input label="State" defaultValue="Haryana" />
                      <Input label="PIN Code" defaultValue="122001" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Phone" defaultValue="+91 98765 43210" />
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Timezone</label>
                        <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                          <option>Asia/Kolkata (IST)</option>
                          <option>Asia/Dubai</option>
                          <option>America/New_York</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Auto-delete files after</label>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue={7} className="w-24" />
                        <span className="text-sm text-muted-foreground">days</span>
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Save className="h-4 w-4" /> Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="branding">
                <Card>
                  <CardHeader>
                    <CardTitle>Branding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Shop Logo</label>
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <Button variant="outline">Upload Logo</Button>
                      </div>
                    </div>
                    <Input label="Primary Color" type="color" defaultValue="#2563eb" className="w-20 h-10" />
                    <Input label="Custom Domain" placeholder="print.yourshop.com" />
                    <Button className="gap-2">
                      <Save className="h-4 w-4" /> Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Staff Login Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified when staff logs in</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Button variant="destructive">Change Password</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Orders</p>
                        <p className="text-sm text-muted-foreground">When a new order is placed</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order Ready</p>
                        <p className="text-sm text-muted-foreground">When order is ready for pickup</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Payment Received</p>
                        <p className="text-sm text-muted-foreground">When a payment is completed</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Low Stock Alerts</p>
                        <p className="text-sm text-muted-foreground">When paper or ink is running low</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Updates</p>
                        <p className="text-sm text-muted-foreground">Product updates and maintenance</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
