"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  CheckCircle2,
  Crown,
  Loader2,
  Lock,
  Printer,
  Server,
  Sparkles,
  XCircle,
} from "lucide-react"
import {
  disableAutomationAction,
  enableAutomationAction,
  getAutomationPanelAction,
  startAutomationCheckoutAction,
  updateAutomationSettingsAction,
} from "@/lib/actions/automation.actions"
import type { AutomationPrinterOption } from "@/lib/automation"

interface AutomationData {
  premium: boolean
  planName: string
  price: number
  currentPeriodEnd: string | null
  enabled: boolean
  skipQC: boolean
  printerName: string | null
  activatedAt: string | null
  serverOnline: boolean
  printers: AutomationPrinterOption[]
}

const FEATURES = [
  "Every paid order is queued automatically",
  "Best online printer is selected for each job",
  "Printing starts without any manual clicks",
  "Orders move to ready on their own",
]

export function AutomationPanel() {
  const [data, setData] = useState<AutomationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [skipQC, setSkipQC] = useState(false)
  const [printerName, setPrinterName] = useState("")

  useEffect(() => {
    let cancelled = false
    getAutomationPanelAction().then((result) => {
      if (cancelled) return
      setLoading(false)
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      setData(result.data)
      setSkipQC(result.data.skipQC)
      setPrinterName(result.data.printerName || "")
    })
    return () => {
      cancelled = true
    }
  }, [])

  const refresh = async () => {
    const result = await getAutomationPanelAction()
    if ("error" in result) return
    setData(result.data)
    setSkipQC(result.data.skipQC)
    setPrinterName(result.data.printerName || "")
  }

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get("checkout")
    if (checkout === "success") {
      toast.success("Payment received. Automation Premium is activating...")
      let attempts = 0
      const timer = setInterval(async () => {
        attempts += 1
        const result = await getAutomationPanelAction()
        if (!("error" in result) && result.data.premium) {
          setData(result.data)
          setSkipQC(result.data.skipQC)
          setPrinterName(result.data.printerName || "")
          clearInterval(timer)
          return
        }
        if (attempts >= 10) clearInterval(timer)
      }, 3000)
      return () => clearInterval(timer)
    }
    if (checkout === "cancelled") {
      toast.message("Checkout cancelled. No payment was taken.")
    }
  }, [])

  const startCheckout = async () => {
    setBusy(true)
    const result = await startAutomationCheckoutAction()
    if ("error" in result) {
      setBusy(false)
      toast.error(result.error)
      return
    }
    window.location.href = result.url
  }

  const enable = async () => {
    setBusy(true)
    const result = await enableAutomationAction({
      skipQC,
      printerName: printerName || null,
    })
    setBusy(false)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    toast.success("Automation enabled. New paid orders will print automatically.")
    await refresh()
  }

  const disable = async () => {
    setBusy(true)
    const result = await disableAutomationAction()
    setBusy(false)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    toast.success("Automation disabled")
    await refresh()
  }

  const saveSettings = async () => {
    setBusy(true)
    const result = await updateAutomationSettingsAction({
      skipQC,
      printerName: printerName || null,
    })
    setBusy(false)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    toast.success("Automation settings saved")
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading automation…
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Could not load automation settings.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500" />
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Automate the workflow
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Hands-free printing. Orders are dispatched to the right printer
                and completed without shopkeeper interaction.
              </p>
            </div>
            <Badge variant={data.enabled ? "success" : data.premium ? "default" : "secondary"}>
              {data.enabled ? "Active" : data.premium ? "Premium ready" : "Premium required"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <ul className="grid gap-2 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>

          {!data.premium ? (
            <div className="rounded-xl border bg-muted/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-medium">
                    <Crown className="h-4 w-4 text-amber-500" /> {data.planName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ₹{data.price}/month · cancel anytime
                  </p>
                </div>
                <Button onClick={startCheckout} disabled={busy} className="gap-2">
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  Unlock Automation Premium
                </Button>
              </div>
            </div>
          ) : !data.enabled ? (
            <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm font-medium">Readiness check</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <StatusRow
                  ok={data.serverOnline}
                  okText="Print server online"
                  failText="Print server offline"
                  icon={<Server className="h-4 w-4" />}
                />
                <StatusRow
                  ok={data.printers.length > 0}
                  okText={`${data.printers.length} printer${data.printers.length === 1 ? "" : "s"} online`}
                  failText="No online printers"
                  icon={<Printer className="h-4 w-4" />}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Start the Print Server on your shop computer, then enable
                automation.
              </p>
              <Button
                onClick={enable}
                disabled={busy || !data.serverOnline || data.printers.length === 0}
                className="gap-2"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Enable automation
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Automation is on</p>
                  <p className="text-sm text-muted-foreground">
                    New paid orders print automatically
                    {data.activatedAt
                      ? ` since ${new Date(data.activatedAt).toLocaleDateString()}`
                      : ""}
                    .
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div>
                  <p className="font-medium">Skip quality check</p>
                  <p className="text-sm text-muted-foreground">
                    Move finished orders straight to Ready instead of waiting
                    for a manual quality check.
                  </p>
                </div>
                <Switch checked={skipQC} onCheckedChange={setSkipQC} />
              </div>

              <div className="rounded-lg border p-4">
                <label className="mb-2 block text-sm font-medium">
                  Preferred printer
                </label>
                <select
                  value={printerName}
                  onChange={(event) => setPrinterName(event.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Auto-select best printer</option>
                  {data.printers.map((printer) => (
                    <option key={printer.name} value={printer.name}>
                      {printer.name}
                      {printer.color ? " · colour" : ""}
                      {printer.duplex ? " · duplex" : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-muted-foreground">
                  Auto-select picks the least busy printer that supports the
                  order&apos;s paper, colour and duplex settings.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={saveSettings} disabled={busy} className="gap-2">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save settings
                </Button>
                <Button variant="outline" onClick={disable} disabled={busy}>
                  Turn off automation
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Customer pays for an order.</p>
          <p>2. PrintQ picks an online printer and sends the job.</p>
          <p>3. The print server prints it and reports back.</p>
          <p>
            4. The order is marked {data.skipQC ? "ready" : "quality check"} and
            the customer is notified. If the server or printer is offline, the
            order waits and retries automatically — the owner is alerted.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusRow({
  ok,
  okText,
  failText,
  icon,
}: {
  ok: boolean
  okText: string
  failText: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <XCircle className="h-4 w-4 text-destructive" />
      )}
      {icon}
      <span className={ok ? "" : "text-muted-foreground"}>
        {ok ? okText : failText}
      </span>
    </div>
  )
}
