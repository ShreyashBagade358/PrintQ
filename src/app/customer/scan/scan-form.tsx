"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { QrCode, ScanLine, Loader2, Camera, Keyboard } from "lucide-react"
import { CameraScanner } from "@/components/scan/camera-scanner"

export function ScanForm() {
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"manual" | "camera">("manual")
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = token.trim()
    if (!val) { toast.error("Please enter or paste a QR code"); return }

    setLoading(true)
    try {
      const path = extractToken(val)
      router.push(`/scan/${path}`)
    } catch {
      toast.error("Invalid QR code format")
      setLoading(false)
    }
  }

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText()
    if (text) {
      setToken(text)
      try {
        const path = extractToken(text)
        setLoading(true)
        router.push(`/scan/${path}`)
      } catch {
        toast.error("Clipboard content is not a valid QR code")
      }
    }
  }

  const handleCameraScan = (token: string) => {
    setLoading(true)
    router.push(`/scan/${token}`)
  }

  const handleCameraError = (error: string) => {
    toast.error(error)
    setMode("manual")
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        {mode === "camera" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" /> Camera Scanner
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setMode("manual")} className="gap-1 text-xs">
                <Keyboard className="h-3 w-3" /> Enter Code
              </Button>
            </div>
            <CameraScanner onScan={handleCameraScan} onError={handleCameraError} />
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste QR code or enter token..."
                  className="pl-10 pr-4 h-12 text-base"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 h-12 gap-2 text-base" disabled={loading || !token.trim()}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanLine className="h-5 w-5" />}
                  {loading ? "Verifying..." : "Connect to Shop"}
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={handlePaste}>
                <Camera className="h-4 w-4" /> Paste from Clipboard
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setMode("camera")}>
                <Camera className="h-4 w-4" /> Open Camera
              </Button>
            </div>
          </>
        )}

        <p className="text-xs text-center text-muted-foreground leading-relaxed">
          {mode === "camera"
            ? "Point your camera at the QR code to auto-connect."
            : "Paste the link shared by the shop or type the code manually."}
        </p>
      </CardContent>
    </Card>
  )
}

function extractToken(input: string): string {
  const trimmed = input.trim()
  const urlPattern = /\/scan\/([A-Za-z0-9_-]+)$/
  const match = trimmed.match(urlPattern)
  if (match) return match[1]
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) return trimmed
  throw new Error("Invalid format")
}
