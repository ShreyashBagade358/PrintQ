"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, Loader2 } from "lucide-react"

interface CameraScannerProps {
  onScan: (token: string) => void
  onError?: (error: string) => void
}

export function CameraScanner({ onScan, onError }: CameraScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const scannerRef = useRef<InstanceType<typeof import("html5-qrcode")["Html5Qrcode"]> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop().catch(() => {}) } catch {}
      }
    }
  }, [])

  const startScanning = async () => {
    setInitializing(true)
    setPermissionDenied(false)

    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const scanner = new Html5Qrcode("qr-scanner-viewfinder")
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(() => {})
          setScanning(false)
          setInitializing(false)

          const token = extractToken(decodedText)
          if (token) {
            onScan(token)
          } else {
            onError?.("Could not read QR code. Please try again.")
          }
        },
        () => {}
      )
      setScanning(true)
      setInitializing(false)
    } catch (e) {
      setInitializing(false)
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        setPermissionDenied(true)
        onError?.("Camera permission denied. Please allow camera access or paste the code manually.")
      } else {
        onError?.("Could not start camera. Try pasting the code manually.")
      }
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch {}
      scannerRef.current = null
    }
    setScanning(false)
  }

  return (
    <div className="space-y-3">
      <div
        id="qr-scanner-viewfinder"
        ref={containerRef}
        className={`relative overflow-hidden rounded-xl bg-black ${scanning ? "block" : "hidden"}`}
        style={{ minHeight: scanning ? 280 : 0 }}
      />

      {!scanning && (
        <Button
          variant="outline"
          className="w-full gap-2 h-12"
          onClick={startScanning}
          disabled={initializing}
        >
          {initializing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
          {initializing ? "Starting Camera..." : "Scan with Camera"}
        </Button>
      )}

      {scanning && (
        <Button
          variant="outline"
          className="w-full gap-2 h-12"
          onClick={stopScanning}
        >
          <CameraOff className="h-5 w-5" />
          Stop Camera
        </Button>
      )}

      {permissionDenied && (
        <p className="text-xs text-destructive text-center">
          Camera access blocked. Update your browser settings or paste the code below.
        </p>
      )}
    </div>
  )
}

function extractToken(input: string): string | null {
  const trimmed = input.trim()
  const urlPattern = /\/scan\/([A-Za-z0-9_-]+)/
  const match = trimmed.match(urlPattern)
  if (match) return match[1]
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) return trimmed
  return null
}
