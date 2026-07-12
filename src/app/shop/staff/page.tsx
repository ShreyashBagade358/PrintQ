"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, Trash2, Mail } from "lucide-react"
import { getStaffMembersAction, inviteStaffAction, removeStaffAction } from "@/lib/actions/shop.actions"
import { toast } from "sonner"

export default function ShopStaffPage() {
  const [staff, setStaff] = useState<Awaited<ReturnType<typeof getStaffMembersAction>>>([])
  const [loading, setLoading] = useState(true)
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("staff")
  const [inviting, setInviting] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const data = await getStaffMembersAction()
    setStaff(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleInvite = async () => {
    if (!inviteName || !inviteEmail) { toast.error("Name and email are required"); return }
    setInviting(true)
    const form = new FormData()
    form.set("name", inviteName)
    form.set("email", inviteEmail)
    form.set("role", inviteRole)
    const result = await inviteStaffAction(null, form)
    setInviting(false)
    if (result.success) {
      toast.success("Staff member added")
      setInviteName(""); setInviteEmail(""); setInviteRole("staff")
      fetch()
    } else {
      toast.error(result.error || "Failed to invite staff")
    }
  }

  const handleRemove = async (staffId: string, name: string) => {
    if (!confirm(`Remove ${name} from staff?`)) return
    const result = await removeStaffAction(staffId)
    if (result.success) {
      toast.success("Staff member removed")
      fetch()
    } else {
      toast.error(result.error || "Failed to remove staff")
    }
  }

  const permissionsList = (perms: string[]) => {
    const labels: Record<string, string> = {
      view_orders: "Orders",
      update_orders: "Edit Orders",
      manage_customers: "Customers",
      manage_staff: "Staff",
      manage_settings: "Settings",
    }
    return perms.map((p) => labels[p] || p)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Staff Management" type="shop" />
      <div className="flex">
        <Sidebar type="shop" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-2xl font-bold">Staff Members</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : staff.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">No staff members yet.</p>
                  ) : (
                  <div className="overflow-x-auto">
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
                      {staff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.user.name}</TableCell>
                          <TableCell>{member.user.email}</TableCell>
                          <TableCell className="capitalize">{member.role}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {permissionsList(member.permissions).map((p) => (
                                <span key={p} className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell><StatusBadge status={member.status.toLowerCase()} /></TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemove(member.id, member.user.name)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </div>
                  )}
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
                  <Input label="Name" placeholder="Staff name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
                  <Input label="Email" type="email" placeholder="staff@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Role</label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="mt-4 gap-2" onClick={handleInvite} loading={inviting}>
                  <UserPlus className="h-4 w-4" /> Send Invitation
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
