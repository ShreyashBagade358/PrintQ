"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Save, Upload, Shield, Bell, Eye, Server, Copy, ExternalLink, Terminal } from "lucide-react"

export default function ShopSettingsPage() {
  return (
    <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="print-server">Print Server</TabsTrigger>
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

              <TabsContent value="print-server">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" /> Print Server
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      When hosted on Vercel, PrintQ can't print directly (no CUPS). The print server runs on
                      your shop computer, polls Vercel for jobs, and sends them to your local printers.
                    </p>

                    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Terminal className="h-4 w-4" /> Setup (3 steps)
                      </p>
                      <ol className="text-sm text-muted-foreground space-y-3 list-decimal list-inside">
                        <li>
                          Add <code className="bg-background px-1.5 py-0.5 rounded text-xs">PRINT_SERVER_SECRET</code> to
                          your Vercel env vars. Generate one with:
                          <div className="bg-background rounded p-2 mt-1 font-mono text-xs">openssl rand -hex 32</div>
                        </li>
                        <li>
                          Go to <strong>Shop &gt; Printers</strong> and click <strong>Register Server</strong>. Copy the token shown.
                        </li>
                        <li>
                          On the computer connected to your printers, run:
                          <div className="bg-background rounded p-2 mt-1 font-mono text-xs space-y-0.5">
                            <p className="text-muted-foreground"># Copy print-server.js from your project, then:</p>
                            <p>PRINTQ_URL=https://your-app.vercel.app \</p>
                            <p>PRINTQ_TOKEN=psk_xxx \</p>
                            <p>PRINTQ_NAME="Front Desk" \</p>
                            <p>node print-server.js</p>
                          </div>
                        </li>
                      </ol>
                    </div>

                    <div className="rounded-lg border p-4 space-y-2">
                      <p className="text-sm font-medium">How it works</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          Print server polls Vercel every 2 seconds for pending print jobs.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          Downloads the file and prints via CUPS (<code className="bg-muted px-1 py-0.5 rounded text-xs">lp -d printerName file</code>).
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          Reports status (printing / completed / failed) back to Vercel in real-time.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          Heartbeat every 30s keeps the server marked as ONLINE.
                        </li>
                      </ul>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      When self-hosted (not on Vercel), PrintQ falls back to local CUPS automatically — no print server needed.
                    </p>
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
    </div>
  )
}
