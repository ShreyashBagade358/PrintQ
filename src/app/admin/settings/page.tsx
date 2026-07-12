"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Global Settings" type="admin" />
      <div className="flex">
        <Sidebar type="admin" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6 space-y-6">
              <Card>
                <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Platform Name" defaultValue="PrintQ" />
                    <Input label="Support Email" defaultValue="support@printq.com" />
                    <Input label="Default Timezone" defaultValue="Asia/Kolkata (IST)" />
                    <Input label="File Retention (days)" type="number" defaultValue={7} />
                  </div>
                  <Button className="gap-2"><Save className="h-4 w-4" /> Save</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Feature Toggles</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {["Allow Guest Checkout", "Enable Coupons", "Multi-language Support", "Dark Mode", "Export Reports"].map((f) => (
                    <div key={f} className="flex items-center justify-between">
                      <span className="font-medium">{f}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="limits" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Default Plan Limits</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input label="Max File Size (MB)" type="number" defaultValue={50} />
                    <Input label="Max Pages per Order" type="number" defaultValue={500} />
                    <Input label="Max Printers per Shop" type="number" defaultValue={20} />
                  </div>
                  <Button className="gap-2"><Save className="h-4 w-4" /> Save</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
