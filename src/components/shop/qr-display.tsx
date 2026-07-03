"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { QrCode, Download, Share2, Check, Copy, Loader2, Store, Key } from "lucide-react"
import { getShopQrAction } from "@/lib/actions/qr.actions"

interface QrData {
  shopId: string
  shopName: string
  logo: string | null
  qrToken: string
  regeneratedAt: string
  status: string
}

export function QrDisplay() {
  const [data, setData] = useState<QrData | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)

  const fetchQr = useCallback(async () => {
    const result = await getShopQrAction()
    if ("error" in result) {
      toast.error(result.error)
      setLoading(false)
      return
    }
    setData(result as unknown as QrData)
    setLoading(false)
  }, [])

  useEffect(() => { fetchQr() }, [fetchQr])

  useEffect(() => {
    if (!data?.qrToken) return
    import("qrcode").then((qr) => {
      qr.toDataURL(data.qrToken, {
        width: 400,
        margin: 2,
        color: { dark: "#1a1a2e", light: "#ffffff" },
      }).then(setQrDataUrl)
    })
  }, [data?.qrToken])

  const handleDownload = () => {
    if (!qrDataUrl) return
    const link = document.createElement("a")
    link.download = `${data?.shopName || "shop"}-qr.png`
    link.href = qrDataUrl
    link.click()
    toast.success("QR code downloaded")
  }

  const handleCopyLink = async () => {
    if (!data?.qrToken) return
    const scanUrl = `${window.location.origin}/scan/${data.qrToken}`
    await navigator.clipboard.writeText(scanUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Scan link copied to clipboard")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" /> Shop QR Code</CardTitle></CardHeader>
        <CardContent><div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" /> Shop QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-5">
            <div className="relative rounded-2xl border-2 border-primary/20 bg-white p-4 shadow-sm">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`${data?.shopName} QR code`} className="h-48 w-48 object-contain" />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center bg-muted rounded-lg">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 pointer-events-none" />
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
                <Store className="h-4 w-4 text-primary" /> {data?.shopName}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Customers scan this QR to connect and place orders
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" /> Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy Link"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                navigator.clipboard.writeText(data?.qrToken || "")
                toast.success("Token copied")
              }} className="gap-2">
                <Key className="h-4 w-4" /> Token: {data?.qrToken.slice(0, 6)}...
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const url = `${window.location.origin}/scan/${data?.qrToken}`
                if (navigator.share) navigator.share({ title: `${data?.shopName} - PrintQ`, url })
                else handleCopyLink()
              }} className="gap-2">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Place this QR at your counter, on business cards, or share on social media.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
