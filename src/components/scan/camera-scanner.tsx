"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, Loader2 } from "lucide-react"
import { extractQrToken } from "@/lib/utils"

interface CameraScannerProps {
  onScan: (token: string) => void
  onError?: (error: string) => void
}

export function CameraScanner({ onScan, onError }: CameraScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const destroyRef = useRef(false)

  useEffect(() => {
    return () => {
      destroyRef.current = true
      if (scannerRef.current) {
        try { scannerRef.current.stop().catch(() => {}) } catch {}
        scannerRef.current = null
      }
    }
  }, [])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch {}
      scannerRef.current = null
    }
    startedRef.current = false
    setScanning(false)
    setInitializing(false)
  }, [])

  const handleDecoded = useCallback(
    (decodedText: string) => {
      const token = extractQrToken(decodedText)
      if (token) {
        stopScanner().then(() => onScan(token))
      } else {
        onError?.("Could not read QR code. Please try again.")
      }
    },
    [onScan, onError, stopScanner]
  )

  const startScanning = useCallback(async () => {
    if (destroyRef.current) return
    setPermissionDenied(false)
    setInitializing(true)

    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      if (destroyRef.current || startedRef.current) return

      const scanner = new Html5Qrcode("qr-scanner-viewfinder")
      scannerRef.current = scanner
      startedRef.current = true
      setScanning(true)
      setInitializing(false)

      // Wait for React to flush DOM update so viewfinder has dimensions
      await new Promise((resolve) => setTimeout(resolve, 100))

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 300, height: 300 }, aspectRatio: 1.0 },
          handleDecoded,
          () => {}
        )
      } catch {
        // Environment camera unavailable — fall back to the front/facing user camera.
        if (destroyRef.current) return
        try { await scanner.stop() } catch {}
        await scanner.start(
          { facingMode: "user" },
          { fps: 10, qrbox: { width: 300, height: 300 }, aspectRatio: 1.0 },
          handleDecoded,
          () => {}
        )
      }
    } catch (e) {
      startedRef.current = false
      scannerRef.current = null
      setScanning(false)
      setInitializing(false)
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        setPermissionDenied(true)
        onError?.("Camera permission denied. Please allow camera access or paste the code manually.")
      } else {
        onError?.("Could not start camera. Try pasting the code manually.")
      }
    }
  }, [onError, handleDecoded])

  return (
    <div className="space-y-3">
      <div
        id="qr-scanner-viewfinder"
        ref={containerRef}
        className="relative overflow-hidden rounded-xl bg-black w-full"
        style={{ height: scanning ? "min(70vw, 400px)" : 0, opacity: scanning ? 1 : 0, transition: "height 0.3s, opacity 0.3s" }}
      />

      <div className="flex gap-2">
        {!scanning && !initializing && (
          <Button variant="outline" className="flex-1 gap-2 h-12" onClick={startScanning}>
            <Camera className="h-5 w-5" /> Scan with Camera
          </Button>
        )}
        {initializing && (
          <Button variant="outline" className="flex-1 gap-2 h-12" disabled>
            <Loader2 className="h-5 w-5 animate-spin" /> Starting Camera...
          </Button>
        )}
        {scanning && (
          <Button variant="outline" className="flex-1 gap-2 h-12" onClick={stopScanner}>
            <CameraOff className="h-5 w-5" /> Stop Camera
          </Button>
        )}
      </div>

      {permissionDenied && (
        <p className="text-xs text-destructive text-center">
          Camera access blocked. Update your browser settings or paste the code below.
        </p>
      )}
    </div>
  )
}