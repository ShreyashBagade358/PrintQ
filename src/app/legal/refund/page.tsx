"use client"

import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RefundPage() {
  return (
    <>
      <PublicNavbar />
      <main className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Refund Eligibility</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>You may be eligible for a refund in the following cases:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Print job cancelled before printing has started</li>
                  <li>Service subscription cancelled within 14 days of purchase (annual plans only)</li>
                  <li>Duplicate charge or billing error</li>
                  <li>Service downtime exceeding 24 hours (prorated credit)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Non-Refundable Items</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="list-disc pl-6 space-y-1">
                  <li>Completed print jobs (quality claims should be directed to the print shop)</li>
                  <li>Monthly subscription fees after the billing period has started</li>
                  <li>Add-on services that have been fully delivered</li>
                  <li>Third-party transaction fees</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refund Process</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>To request a refund:</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Contact our support team at support@printq.com</li>
                  <li>Provide your account details and reason for refund</li>
                  <li>Include relevant order or transaction IDs</li>
                  <li>Allow 5-10 business days for processing</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>Email: support@printq.com</p>
                <p>Phone: +91 1800-123-4567</p>
                <p>Working hours: Mon-Sat, 9:00 AM - 6:00 PM IST</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
