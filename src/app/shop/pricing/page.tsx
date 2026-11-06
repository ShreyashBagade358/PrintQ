"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Pencil, Plus, Save, Trash2, X } from "lucide-react"
import {
  getPricingAction,
  upsertPricingRuleAction,
  deletePricingRuleAction,
  saveFinishingChargesAction,
} from "@/lib/actions/shop.actions"

const PAPER_SIZES = ["A4", "A3", "A5"] as const
const COLOR_LABELS: Record<string, string> = {
  black_white: "Black & White",
  color: "Color",
}

interface PricingRule {
  id: string
  paperSize: string
  colorType: string
  pricePerPage: number
  minCopies: number
}

interface FinishingCharges {
  stapling: number
  spiral: number
  hardcover: number
  lamination: number
}

interface RuleDraft {
  paperSize: string
  colorType: "black_white" | "color"
  pricePerPage: string
  minCopies: string
}

const EMPTY_RULE: RuleDraft = {
  paperSize: "A4",
  colorType: "black_white",
  pricePerPage: "",
  minCopies: "1",
}

const DEFAULT_FINISHING: FinishingCharges = {
  stapling: 5,
  spiral: 2,
  hardcover: 150,
  lamination: 20,
}

export default function ShopPricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [finishing, setFinishing] = useState<FinishingCharges>(DEFAULT_FINISHING)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [newRule, setNewRule] = useState<RuleDraft>(EMPTY_RULE)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<RuleDraft>(EMPTY_RULE)

  const applyPricing = useCallback((res: Awaited<ReturnType<typeof getPricingAction>>) => {
    if ("error" in res) {
      toast.error(res.error)
      setLoading(false)
      return
    }
    setRules(
      res.rules.map((r) => ({
        id: r.id,
        paperSize: r.paperSize,
        colorType: r.colorType,
        pricePerPage: r.pricePerPage,
        minCopies: r.minCopies ?? 1,
      }))
    )
    if (res.finishing) {
      setFinishing({
        stapling: res.finishing.staplingCharge,
        spiral: res.finishing.spiralCharge,
        hardcover: res.finishing.hardcoverCharge,
        lamination: res.finishing.laminationCharge,
      })
    }
    setLoading(false)
  }, [])

  const fetchData = useCallback(async () => {
    applyPricing(await getPricingAction())
  }, [applyPricing])

  useEffect(() => {
    let active = true
    getPricingAction().then((res) => {
      if (active) applyPricing(res)
    })
    return () => {
      active = false
    }
  }, [applyPricing])

  const validate = (rule: RuleDraft): string | null => {
    const price = Number(rule.pricePerPage)
    const min = Number(rule.minCopies)
    if (!rule.paperSize) return "Choose a paper size"
    if (!Number.isFinite(price) || price <= 0) return "Enter a valid price per page"
    if (!Number.isInteger(min) || min < 1) return "Min copies must be at least 1"
    return null
  }

  const handleAddRule = async () => {
    const error = validate(newRule)
    if (error) {
      toast.error(error)
      return
    }
    setSaving(true)
    const res = await upsertPricingRuleAction({
      paperSize: newRule.paperSize,
      colorType: newRule.colorType,
      pricePerPage: Number(newRule.pricePerPage),
      minCopies: Number(newRule.minCopies),
    })
    setSaving(false)

    if ("error" in res) {
      toast.error(res.error)
      return
    }
    toast.success("Pricing rule saved")
    setNewRule(EMPTY_RULE)
    await fetchData()
  }

  const startEdit = (rule: PricingRule) => {
    setEditingId(rule.id)
    setDraft({
      paperSize: rule.paperSize,
      colorType: rule.colorType === "color" ? "color" : "black_white",
      pricePerPage: String(rule.pricePerPage),
      minCopies: String(rule.minCopies),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft(EMPTY_RULE)
  }

  const handleSaveEdit = async (id: string) => {
    const error = validate(draft)
    if (error) {
      toast.error(error)
      return
    }
    setSaving(true)
    const res = await upsertPricingRuleAction({
      id,
      paperSize: draft.paperSize,
      colorType: draft.colorType,
      pricePerPage: Number(draft.pricePerPage),
      minCopies: Number(draft.minCopies),
    })
    setSaving(false)

    if ("error" in res) {
      toast.error(res.error)
      return
    }
    toast.success("Pricing rule updated")
    cancelEdit()
    await fetchData()
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    const res = await deletePricingRuleAction(id)
    setSaving(false)

    if ("error" in res) {
      toast.error(res.error)
      return
    }
    if (editingId === id) cancelEdit()
    toast.success("Pricing rule deleted")
    await fetchData()
  }

  const handleSaveFinishing = async () => {
    const values = [finishing.stapling, finishing.spiral, finishing.hardcover, finishing.lamination]
    if (values.some((v) => !Number.isFinite(v) || v < 0)) {
      toast.error("Charges must be zero or greater")
      return
    }
    setSaving(true)
    const res = await saveFinishingChargesAction(finishing)
    setSaving(false)

    if ("error" in res) {
      toast.error(res.error)
      return
    }
    toast.success("Finishing charges saved")
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>Price Per Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paper Size</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price/Page (₹)</TableHead>
                    <TableHead>Min Copies</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        Loading pricing rules…
                      </TableCell>
                    </TableRow>
                  ) : rules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No pricing rules yet. Add your first rule below.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rules.map((rule) => {
                      const isEditing = editingId === rule.id
                      return (
                        <TableRow key={rule.id}>
                          {isEditing ? (
                            <>
                              <TableCell>
                                <Select
                                  value={draft.paperSize}
                                  onValueChange={(value) => setDraft((d) => ({ ...d, paperSize: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PAPER_SIZES.map((size) => (
                                      <SelectItem key={size} value={size}>
                                        {size}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={draft.colorType}
                                  onValueChange={(value) =>
                                    setDraft((d) => ({ ...d, colorType: value as RuleDraft["colorType"] }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="black_white">Black &amp; White</SelectItem>
                                    <SelectItem value="color">Color</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={draft.pricePerPage}
                                  onChange={(e) => setDraft((d) => ({ ...d, pricePerPage: e.target.value }))}
                                  className="w-28"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  value={draft.minCopies}
                                  onChange={(e) => setDraft((d) => ({ ...d, minCopies: e.target.value }))}
                                  className="w-24"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600"
                                    disabled={saving}
                                    onClick={() => handleSaveEdit(rule.id)}
                                    aria-label="Save rule"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={saving}
                                    onClick={cancelEdit}
                                    aria-label="Cancel edit"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{rule.paperSize}</TableCell>
                              <TableCell>{COLOR_LABELS[rule.colorType] ?? rule.colorType}</TableCell>
                              <TableCell>₹{rule.pricePerPage}</TableCell>
                              <TableCell>{rule.minCopies}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={saving}
                                    onClick={() => startEdit(rule)}
                                    aria-label="Edit rule"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    disabled={saving}
                                    onClick={() => handleDelete(rule.id)}
                                    aria-label="Delete rule"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 rounded-lg border p-4">
              <h4 className="font-medium mb-4">Add Pricing Rule</h4>
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Paper Size</label>
                  <Select
                    value={newRule.paperSize}
                    onValueChange={(value) => setNewRule((r) => ({ ...r, paperSize: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAPER_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Type</label>
                  <Select
                    value={newRule.colorType}
                    onValueChange={(value) =>
                      setNewRule((r) => ({ ...r, colorType: value as RuleDraft["colorType"] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black_white">Black &amp; White</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  label="Price per Page (₹)"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="2"
                  value={newRule.pricePerPage}
                  onChange={(e) => setNewRule((r) => ({ ...r, pricePerPage: e.target.value }))}
                />
                <Input
                  label="Min Copies"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={newRule.minCopies}
                  onChange={(e) => setNewRule((r) => ({ ...r, minCopies: e.target.value }))}
                />
              </div>
              <Button className="mt-4 gap-2" onClick={handleAddRule} disabled={saving}>
                <Plus className="h-4 w-4" /> Add Rule
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="font-medium">Finishing Charges</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Stapling (₹)"
                  type="number"
                  min="0"
                  value={finishing.stapling}
                  onChange={(e) => setFinishing((f) => ({ ...f, stapling: Number(e.target.value) }))}
                />
                <Input
                  label="Spiral Binding (₹)"
                  type="number"
                  min="0"
                  value={finishing.spiral}
                  onChange={(e) => setFinishing((f) => ({ ...f, spiral: Number(e.target.value) }))}
                />
                <Input
                  label="Hardcover Binding (₹)"
                  type="number"
                  min="0"
                  value={finishing.hardcover}
                  onChange={(e) => setFinishing((f) => ({ ...f, hardcover: Number(e.target.value) }))}
                />
                <Input
                  label="Lamination (₹)"
                  type="number"
                  min="0"
                  value={finishing.lamination}
                  onChange={(e) => setFinishing((f) => ({ ...f, lamination: Number(e.target.value) }))}
                />
              </div>
            </div>

            <Button className="mt-6 gap-2" onClick={handleSaveFinishing} disabled={saving}>
              <Save className="h-4 w-4" /> Save All Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}