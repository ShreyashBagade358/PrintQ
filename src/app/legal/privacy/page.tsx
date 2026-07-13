"use client"

import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <>
      <PublicNavbar />
      <main className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Account information (name, email, phone number)</li>
                  <li>Shop details and business information</li>
                  <li>Print job files and documents you upload</li>
                  <li>Payment information (processed securely by Stripe)</li>
                  <li>Communications with support team</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <ul className="list-disc pl-6 space-y-1">
                  <li>To provide and maintain our print management services</li>
                  <li>To process your print jobs and manage orders</li>
                  <li>To send notifications about your orders</li>
                  <li>To improve our platform and user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Sharing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>We do not sell your personal information. We may share data with:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Print shops you place orders with (necessary for service)</li>
                  <li>Payment processors (Stripe) for transaction processing</li>
                  <li>Cloud storage providers for file hosting</li>
                  <li>Law enforcement when required by law</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>We implement industry-standard security measures:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Automatic file deletion after retention period</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your data (subject to legal requirements)</li>
                  <li>Export your data</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>For privacy-related inquiries:</p>
                <p>Email: privacy@printq.com</p>
                <p>Address: 42, PrintQ Tower, Sector 14, Gurugram, Haryana 122001</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
