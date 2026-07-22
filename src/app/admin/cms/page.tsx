"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Edit, Eye, FileText, HelpCircle, Globe } from "lucide-react"

export default function AdminCMSPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="pages">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="pages" className="gap-2"><Globe className="h-4 w-4" /> Pages</TabsTrigger>
            <TabsTrigger value="blog" className="gap-2"><FileText className="h-4 w-4" /> Blog</TabsTrigger>
            <TabsTrigger value="faq" className="gap-2"><HelpCircle className="h-4 w-4" /> FAQ</TabsTrigger>
          </TabsList>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add New
          </Button>
        </div>

        <TabsContent value="pages">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { title: "Privacy Policy", slug: "privacy", type: "policy", status: "published", updated: "Jan 10" },
                    { title: "Terms of Service", slug: "terms", type: "policy", status: "published", updated: "Jan 10" },
                    { title: "About Us", slug: "about", type: "page", status: "published", updated: "Dec 20" },
                    { title: "Refund Policy", slug: "refund", type: "policy", status: "draft", updated: "Jan 5" },
                  ].map((page) => (
                    <TableRow key={page.slug}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell className="font-mono text-sm">/{page.slug}</TableCell>
                      <TableCell className="capitalize">{page.type}</TableCell>
                      <TableCell><StatusBadge status={page.status === "published" ? "active" : "inactive"} /></TableCell>
                      <TableCell className="text-muted-foreground">{page.updated}</TableCell>
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
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["How do I upload a print job?", "What payment methods are accepted?", "How long does printing take?"].map((q, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{q}</p>
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Sample answer content for this frequently asked question.</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
