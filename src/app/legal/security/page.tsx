"use client"

import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SecurityPage() {
  return (
    <>
      <PublicNavbar />
      <main className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Security Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Encryption</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>We protect your data using industry-standard encryption:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>All data in transit is encrypted using TLS 1.3</li>
                  <li>All data at rest is encrypted using AES-256</li>
                  <li>File uploads are encrypted before storage</li>
                  <li>Database backups are encrypted</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="list-disc pl-6 space-y-1">
                  <li>Hosted on AWS with SOC 2 compliance</li>
                  <li>Multi-region redundancy for high availability</li>
                  <li>DDoS protection and Web Application Firewall</li>
                  <li>Regular vulnerability scanning and penetration testing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="list-disc pl-6 space-y-1">
                  <li>Role-based access control (RBAC) for all users</li>
                  <li>Multi-factor authentication available</li>
                  <li>Session management and automatic timeout</li>
                  <li>IP-based access restrictions available</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backups</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="list-disc pl-6 space-y-1">
                  <li>Automated daily backups with 30-day retention</li>
                  <li>Cross-region backup replication</li>
                  <li>Point-in-time recovery capability</li>
                  <li>Regular backup restoration testing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident Response</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="list-disc pl-6 space-y-1">
                  <li>24/7 monitoring and alerting system</li>
                  <li>Dedicated security incident response team</li>
                  <li>Notification within 72 hours of confirmed breach</li>
                  <li>Post-incident analysis and improvement</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use strong passwords and enable 2FA</li>
                  <li>Keep your login credentials confidential</li>
                  <li>Report suspicious activity immediately</li>
                  <li>Log out from shared devices</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
