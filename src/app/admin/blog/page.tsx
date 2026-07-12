"use client"

import { motion } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Eye } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"

export default function AdminBlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Blog Management" type="admin" />
      <div className="flex">
        <Sidebar type="admin" />
        <main className="flex-1 p-6 lg:p-8 md:ml-16 lg:ml-64 space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search posts..." className="pl-9" />
            </div>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Post</Button>
          </div>

          <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { title: "10 Ways to Improve Efficiency", category: "Tips", author: "Admin", status: "published", date: "Jan 15" },
                    { title: "2025 Print Trends", category: "News", author: "Admin", status: "published", date: "Jan 10" },
                    { title: "Smart Queue AI Feature", category: "Updates", author: "Admin", status: "draft", date: "Jan 5" },
                  ].map((post) => (
                    <TableRow key={post.title}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.category}</TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell><StatusBadge status={post.status === "published" ? "active" : "inactive"} /></TableCell>
                      <TableCell>{post.date}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table></div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
