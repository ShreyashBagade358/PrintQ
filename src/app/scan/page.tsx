import Link from "next/link"
import { ScanForm } from "./scan-form"

export const metadata = { title: "Scan Shop QR - PrintQ" }

export default function ScanPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/public/landing" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-2m0-4V7a2 2 0 00-2-2h-2M7 7H5a2 2 0 00-2 2v2m0 4v2a2 2 0 002 2h2" />
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-bold">Scan Shop QR</h1>
          <p className="mt-2 text-muted-foreground">
            Enter the QR code link or scan code to connect with a print shop
          </p>
        </div>

        <ScanForm />
      </div>
    </div>
  )
}
