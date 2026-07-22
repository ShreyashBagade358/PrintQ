"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MessageSquare, HelpCircle, FileText } from "lucide-react"

export default function CustomerSupportPage() {
  return (
    <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: MessageSquare, title: "Live Chat", desc: "Chat with our team" },
              { icon: HelpCircle, title: "Help Center", desc: "Browse articles" },
              { icon: FileText, title: "Submit Ticket", desc: "For complex issues" },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle>Submit a Ticket</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Subject" placeholder="Brief description of your issue" />
              <Textarea label="Message" placeholder="Describe your issue in detail..." className="min-h-[150px]" />
              <Button>Submit Ticket</Button>
            </CardContent>
          </Card>
    </div>
  )
}
