"use client"

import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <>
      <PublicNavbar />
      <main className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>

          <div className="space-y-8">
            {sections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  {section.content.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}

const sections = [
  {
    title: "Acceptance of Terms",
    content: [
      "By accessing or using PrintQ, you agree to be bound by these Terms of Service.",
      "If you do not agree to these terms, please do not use our services.",
      "We reserve the right to update these terms at any time. Continued use constitutes acceptance of changes.",
    ],
  },
  {
    title: "Description of Service",
    content: [
      "PrintQ provides a cloud-based print shop management platform connecting customers with print shops.",
      "We facilitate the upload, processing, and tracking of print jobs.",
      "Print shops are independent businesses and not employees or agents of PrintQ.",
    ],
  },
  {
    title: "User Accounts",
    content: [
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You must provide accurate and complete information when creating an account.",
      "You are responsible for all activities that occur under your account.",
      "Notify us immediately of any unauthorized use of your account.",
    ],
  },
  {
    title: "Payments and Billing",
    content: [
      "Subscription fees are billed in advance on a monthly or annual basis.",
      "All payments are processed securely through Stripe.",
      "Refunds are handled according to our Refund Policy.",
      "Failure to pay may result in suspension of service.",
    ],
  },
  {
    title: "Limitation of Liability",
    content: [
      "PrintQ is provided 'as is' without warranty of any kind.",
      "We are not liable for any damages arising from the use of our service.",
      "Our total liability is limited to the amount paid for the service in the past 12 months.",
    ],
  },
  {
    title: "Changes to Terms",
    content: [
      "We may modify these terms at any time. Changes will be posted on this page.",
      "Material changes will be notified via email.",
      "Continued use after changes constitutes acceptance of the new terms.",
    ],
  },
]
