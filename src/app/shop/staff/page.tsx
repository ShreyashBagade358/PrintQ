"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Trash2, Mail } from "lucide-react"

const staffMembers = [
  { name: "Ankit Singh", email: "ankit@printpro.com", role: "Staff", permissions: ["queue", "orders"], status: "active" },
  { name: "Meera Joshi", email: "meera@printpro.com", role: "Staff", permissions: ["queue", "orders", "customers"], status: "active" },
  { name: "Ravi Verma", email: "ravi@printpro.com", role: "Staff", permissions: ["queue"], status: "invited" },
]

export default function ShopStaffPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Staff Management" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-2xl font-bold">Staff Members</h2>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" /> Invite Staff
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMembers.map((member) => (
                      <TableRow key={member.email}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {member.permissions.map((p) => (
                              <span key={p} className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground capitalize">
                                {p}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={member.status} /></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Mail className="h-3 w-3" /> Resend
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Invite Staff Member</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="Name" placeholder="Staff name" />
                  <Input label="Email" type="email" placeholder="staff@example.com" />
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Role</label>
                    <Select defaultValue="staff">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="mt-4 gap-2">
                  <Mail className="h-4 w-4" /> Send Invitation
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
