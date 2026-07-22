"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Edit, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"

export default function AdminHelpArticlesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search articles..." className="pl-9" />
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> New Article</Button>
      </div>

      <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { title: "How to upload a print job", category: "Getting Started", views: 1250, status: "published", updated: "Jan 10" },
                  { title: "Understanding pricing", category: "Billing", views: 890, status: "published", updated: "Jan 8" },
                  { title: "Tracking your order", category: "Orders", views: 2100, status: "published", updated: "Jan 5" },
                  { title: "Setting up your shop", category: "Shops", views: 0, status: "draft", updated: "Jan 3" },
                ].map((article) => (
                  <TableRow key={article.title}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell>{article.views}</TableCell>
                    <TableCell><StatusBadge status={article.status === "published" ? "active" : "inactive"} /></TableCell>
                    <TableCell>{article.updated}</TableCell>
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
    </div>
  )
}
