"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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
  const startedRef = useRef(false)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop().catch(() => {}) } catch {}
      }
    }
  }, [])

  const startScanning = useCallback(async () => {
    setPermissionDenied(false)
    setInitializing(true)
    setScanning(true)

    // Wait for the viewfinder div to render in the DOM with its dimensions
    await new Promise((resolve) => setTimeout(resolve, 100))

    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      if (startedRef.current) return
      const scanner = new Html5Qrcode("qr-scanner-viewfinder")
      scannerRef.current = scanner
      startedRef.current = true

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(() => {})
          setScanning(false)
          setInitializing(false)
          startedRef.current = false
          scannerRef.current = null

          const token = extractToken(decodedText)
          if (token) {
            onScan(token)
          } else {
            onError?.("Could not read QR code. Please try again.")
          }
        },
        () => {}
      )
      setInitializing(false)
    } catch (e) {
      setInitializing(false)
      setScanning(false)
      startedRef.current = false
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        setPermissionDenied(true)
        onError?.("Camera permission denied. Please allow camera access or paste the code manually.")
      } else {
        onError?.("Could not start camera. Try pasting the code manually.")
      }
    }
  }, [onScan, onError])

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch {}
      scannerRef.current = null
    }
    startedRef.current = false
    setScanning(false)
    setInitializing(false)
  }, [])

  return (
    <div className="space-y-3">
      {/* Viewfinder always mounted when scanning; hidden otherwise */}
      <div
        id="qr-scanner-viewfinder"
        ref={containerRef}
        className={`relative overflow-hidden rounded-xl bg-black transition-all duration-300 ${
          scanning ? "block" : "hidden"
        }`}
        style={{ minHeight: scanning ? 300 : 0 }}
      >
        {initializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-white/80" />
              <span className="text-xs text-white/60">Starting camera...</span>
            </div>
          </div>
        )}
      </div>

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
  const urlPattern = /\/scan\/([A-Za-z0-9_=-]+)/
  const match = trimmed.match(urlPattern)
  if (match) return match[1]
  if (/^[A-Za-z0-9_=-]+$/.test(trimmed)) return trimmed
  return null
}
