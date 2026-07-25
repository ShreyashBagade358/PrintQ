"use client"

import { ScanForm } from "./scan-form"

export default function ScanPage() {
  return (
    <div className="max-w-lg mx-auto space-y-8 pt-8 px-4">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Scan Shop QR</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the QR code link or scan code to connect with a print shop
        </p>
      </div>
      <ScanForm />
    </div>
  )
}
