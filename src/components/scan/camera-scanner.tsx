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
  const scannerRef = useRef<any>(null)
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

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const token = extractToken(decodedText)
          if (token) {
            stopScanner().then(() => onScan(token))
          } else {
            onError?.("Could not read QR code. Please try again.")
          }
        },
        () => {}
      ).catch(async () => {
        if (destroyRef.current || startedRef.current) return
        await scanner.start(
          { facingMode: "user" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            const token = extractToken(decodedText)
            if (token) {
              stopScanner().then(() => onScan(token))
            } else {
              onError?.("Could not read QR code. Please try again.")
            }
          },
          () => {}
        )
      })
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
  }, [onScan, onError])

  const stopScanner = useCallback(async () => {
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
      <div
        id="qr-scanner-viewfinder"
        ref={containerRef}
        className="relative overflow-hidden rounded-xl bg-black"
        style={{ height: scanning ? 300 : 0, opacity: scanning ? 1 : 0 }}
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

function extractToken(input: string): string | null {
  const trimmed = input.trim()
  const urlPattern = /\/customer\/scan\/([A-Za-z0-9_=-]+)/
  const match = trimmed.match(urlPattern)
  if (match) return match[1]
  if (/^[A-Za-z0-9_=-]+$/.test(trimmed)) return trimmed
  return null
}
