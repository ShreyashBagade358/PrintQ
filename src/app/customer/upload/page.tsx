"use client"

import { useState, useRef, useCallback, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Image, Loader2, Trash2, CheckCircle2, AlertCircle, Eye, HeartHandshake, Palette, Layout, ScanLine, Scaling, RotateCcw, X, Printer, CreditCard, Store } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { genUploader } from "uploadthing/client"
import type { UploadRouter } from "@/lib/uploadthing"
import { APP_NAME } from "@/lib/constants"
import { createCustomerOrderAction } from "@/lib/actions/customer-order.actions"
import { createPaymentIntentAction } from "@/lib/actions/payment.actions"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const { uploadFiles } = genUploader<UploadRouter>({
  url: "/api/uploadthing",
})

const formSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().optional(),
  copies: z.coerce.number().min(1).default(1),
  pageRange: z.enum(["all", "custom"]).default("all"),
  customPageRange: z.string().optional(),
  paperSize: z.enum(["A4", "A3", "A5", "Letter", "Legal", "Tabloid"]).default("A4"),
  orientation: z.enum(["portrait", "landscape"]).default("portrait"),
  color: z.enum(["Black & White", "Color"]).default("Black & White"),
  sides: z.enum(["Single Sided", "Double Sided"]).default("Single Sided"),
  printQuality: z.enum(["draft", "normal", "high"]).default("normal"),
  finishingOptions: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface SelectedFile {
  id: string
  name: string
  size: number
  type: string
  pages: number
  url: string
  uploadStatus: "pending" | "uploading" | "done" | "error"
}

const PRICING = {
  blackWhite: { A4: 2, A3: 4, A5: 1, Letter: 2, Legal: 3, Tabloid: 5 },
  color: { A4: 10, A3: 20, A5: 5, Letter: 10, Legal: 12, Tabloid: 20 },
  finishing: { staple: 5, punch: 3, fold: 8, lamination: 20 },
}

const QUALITY_MULTIPLIER = { draft: 0.75, normal: 1, high: 1.5 }

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
}

async function uploadWithTimeout(file: File): Promise<{ url: string } | undefined> {
  const result = await Promise.race([
    uploadFiles("documentUploader", { files: [file] }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Upload timed out after 60s. Check your internet or file size.")), 60000)
    ),
  ])
  return (result as { url: string }[])?.[0]
}

function CustomerUploadContent() {
  const [files, setFiles] = useState<SelectedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewFile, setPreviewFile] = useState<SelectedFile | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [showPaymentChoice, setShowPaymentChoice] = useState(false)
  const [paymentChoiceLoading, setPaymentChoiceLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalFilesRef = useRef<Map<string, File>>(new Map())
  const pendingOrderRef = useRef<{
    formValues: FormValues
    uploadedFiles: SelectedFile[]
    totalPages: number
    connectedShopId?: string
  } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [connectedShop, setConnectedShop] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const shopId = searchParams.get("connectedShop")
    const shopName = searchParams.get("shopName")
    if (shopId && shopName) {
      setConnectedShop({ id: shopId, name: shopName })
      sessionStorage.setItem("connectedShopId", shopId)
      sessionStorage.setItem("connectedShopName", shopName)
    }
  }, [searchParams])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      copies: 1,
      pageRange: "all",
      customPageRange: "",
      paperSize: "A4",
      orientation: "portrait",
      color: "Black & White",
      sides: "Single Sided",
      printQuality: "normal",
      finishingOptions: [],
      notes: "",
    },
  })

  const values = form.watch()
  const finishingOptions = values.finishingOptions || []

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const valid: SelectedFile[] = []
    for (const f of Array.from(newFiles)) {
      const isDoc = f.type === "application/pdf" || f.type.includes("wordprocessing") || f.type.includes("image")
      if (!isDoc) {
        toast.error(`${f.name} is not a supported file type`)
        continue
      }
      const id = Math.random().toString(36).substring(2)
      originalFilesRef.current.set(id, f)
      valid.push({
        id,
        name: f.name,
        size: f.size,
        type: f.type,
        pages: Math.max(1, Math.round(f.size / 200000)),
        url: URL.createObjectURL(f),
        uploadStatus: "pending",
      })
    }
    setFiles((prev) => [...prev, ...valid])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleBrowse = () => fileInputRef.current?.click()

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files)
    e.target.value = ""
  }

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id)
    if (file?.url.startsWith("blob:")) URL.revokeObjectURL(file.url)
    originalFilesRef.current.delete(id)
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const totalPages = files.reduce((s, f) => s + f.pages, 0)
  const pricePerPage = values.color === "Color"
    ? (PRICING.color as Record<string, number>)[values.paperSize] || 10
    : (PRICING.blackWhite as Record<string, number>)[values.paperSize] || 2
  const qualityMult = QUALITY_MULTIPLIER[values.printQuality]
  const printCost = Math.round(pricePerPage * qualityMult * totalPages * values.copies * 100) / 100
  const finishingCost = finishingOptions.reduce((sum, opt) => sum + ((PRICING.finishing as Record<string, number>)[opt] || 0), 0) * values.copies
  const total = printCost + finishingCost

  async function uploadSelectedFiles(selFiles: SelectedFile[]): Promise<SelectedFile[] | null> {
    const uploaded: SelectedFile[] = []
    for (const file of selFiles) {
      setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, uploadStatus: "uploading" } : f))
      try {
        const original = originalFilesRef.current.get(file.id)
        if (!original) throw new Error("File reference lost. Please re-add the file.")
        const result = await uploadWithTimeout(original)
        if (!result?.url) throw new Error("Upload returned no URL")
        uploaded.push({ ...file, url: result.url, uploadStatus: "done" })
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, url: result.url, uploadStatus: "done" } : f))
      } catch (e) {
        const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e)
        uploaded.push({ ...file, uploadStatus: "error" })
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, uploadStatus: "error" } : f))
        toast.error(`${file.name}: ${msg}`)
      }
    }
    const allDone = uploaded.every((f) => f.uploadStatus === "done")
    return allDone ? uploaded : null
  }

  const handleSubmit = async () => {
    if (!files.length) {
      toast.error("Please upload at least one file")
      return
    }

    const formValid = await form.trigger()
    if (!formValid) return

    setUploading(true)

    const pendingFiles = files.filter((f) => f.uploadStatus !== "done")
    const alreadyDone = files.filter((f) => f.uploadStatus === "done")
    let allFiles: SelectedFile[] = [...alreadyDone]

    if (pendingFiles.length > 0) {
      const result = await uploadSelectedFiles(pendingFiles)
      if (!result) {
        setUploading(false)
        toast.error("Some files failed to upload. Please check and try again.")
        return
      }
      allFiles = [...allFiles, ...result]
    }

    setUploading(false)
    pendingOrderRef.current = {
      formValues: form.getValues(),
      uploadedFiles: allFiles,
      totalPages,
      connectedShopId: connectedShop?.id,
    }
    setPaymentAmount(total)
    setShowPaymentChoice(true)
  }

  const handlePaymentSuccess = async () => {
    const data = pendingOrderRef.current
    if (!data) return

    setPaymentLoading(true)
    const { formValues, uploadedFiles, totalPages, connectedShopId } = data

    const formData = new FormData()
    formData.set("data", JSON.stringify({
      shopId: connectedShopId,
      customerName: formValues.customerName,
      customerEmail: formValues.customerEmail,
      customerPhone: formValues.customerPhone || undefined,
      pages: totalPages,
      copies: formValues.copies,
      color: formValues.color,
      paperSize: formValues.paperSize,
      sides: formValues.sides,
      orientation: formValues.orientation,
      printQuality: formValues.printQuality,
      pageRange: formValues.pageRange,
      customPageRange: formValues.pageRange === "custom" ? formValues.customPageRange : undefined,
      finishingOptions: formValues.finishingOptions,
      notes: formValues.notes || undefined,
      files: uploadedFiles.map((f) => ({
        name: f.name,
        url: f.url,
        size: f.size,
        type: f.type,
        pages: f.pages,
      })),
    }))

    const result = await createCustomerOrderAction(null, formData)
    setPaymentLoading(false)
    setPaymentDialogOpen(false)

    if (result.success) {
      toast.success("Payment successful! Order placed.")
      router.push(`/customer/track?order=${result.orderId}`)
    } else {
      toast.error(result.error || "Order creation failed after payment. Please contact support.")
    }
  }

  const handlePayLater = async () => {
    const data = pendingOrderRef.current
    if (!data) return

    setPaymentChoiceLoading(true)
    const { formValues, uploadedFiles, totalPages, connectedShopId } = data

    const formData = new FormData()
    formData.set("data", JSON.stringify({
      shopId: connectedShopId,
      customerName: formValues.customerName,
      customerEmail: formValues.customerEmail,
      customerPhone: formValues.customerPhone || undefined,
      pages: totalPages,
      copies: formValues.copies,
      color: formValues.color,
      paperSize: formValues.paperSize,
      sides: formValues.sides,
      orientation: formValues.orientation,
      printQuality: formValues.printQuality,
      pageRange: formValues.pageRange,
      customPageRange: formValues.pageRange === "custom" ? formValues.customPageRange : undefined,
      finishingOptions: formValues.finishingOptions,
      paymentMethod: "pay_later",
      notes: formValues.notes || undefined,
      files: uploadedFiles.map((f) => ({
        name: f.name,
        url: f.url,
        size: f.size,
        type: f.type,
        pages: f.pages,
      })),
    }))

    const result = await createCustomerOrderAction(null, formData)
    setPaymentChoiceLoading(false)
    setShowPaymentChoice(false)

    if (result.success) {
      toast.success("Order placed! Awaiting payment confirmation from the shop.")
      router.push(`/customer/track?order=${result.orderId}`)
    } else {
      toast.error(result.error || "Failed to create order. Please try again.")
    }
  }

  const handlePayNow = async () => {
    const data = pendingOrderRef.current
    if (!data) return

    setPaymentChoiceLoading(true)
    const paymentResult = await createPaymentIntentAction(paymentAmount)
    setPaymentChoiceLoading(false)
    if (paymentResult.error) {
      toast.error(paymentResult.error)
      return
    }

    setClientSecret(paymentResult.clientSecret!)
    setShowPaymentChoice(false)
    setPaymentDialogOpen(true)
  }

  const finishingCheckboxes = [
    { id: "staple", label: "Staple", price: PRICING.finishing.staple },
    { id: "punch", label: "Punch", price: PRICING.finishing.punch },
    { id: "fold", label: "Fold", price: PRICING.finishing.fold },
    { id: "lamination", label: "Lamination", price: PRICING.finishing.lamination },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Print Settings" type="customer" />
      <div className="flex">
        <Sidebar type="customer" />
        <main className="flex-1 p-4 lg:p-8 md:ml-16 lg:ml-64">
          <div className="mx-auto max-w-5xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">New Print Job</h1>
              <p className="mt-1 text-muted-foreground">Configure your print settings and place your order.</p>
            </motion.div>

            {connectedShop && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3"
              >
                <Store className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">Connected to {connectedShop.name}</p>
                  <p className="text-xs text-muted-foreground">Your order will be sent directly to this shop.</p>
                </div>
              </motion.div>
            )}

            <motion.div
              custom={0}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5 text-primary" /> Upload Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={handleBrowse}
                    className={`rounded-xl border-2 border-dashed p-6 md:p-10 text-center transition-all cursor-pointer ${
                      dragging
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Upload className={`h-8 w-8 ${dragging ? "text-primary animate-bounce" : "text-primary"}`} />
                    </div>
                    <h3 className="text-lg font-semibold">
                      {dragging ? "Drop your files here" : "Drag & drop your files here"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">or click to browse files</p>
                    <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" className="hidden" onChange={handleFileInput} />
                    <Button variant="outline" className="mt-4" type="button" onClick={(e) => { e.stopPropagation(); handleBrowse() }}>
                      Browse Files
                    </Button>
                    <div className="mt-6 flex justify-center gap-4">
                      {[{ icon: FileText, label: "PDF" }, { icon: FileText, label: "DOCX" }, { icon: Image, label: "PNG" }, { icon: Image, label: "JPG" }].map(({ icon: Icon, label }) => (
                        <span key={label} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Icon className="h-3 w-3" /> {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {files.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-2"
                      >
                        <p className="text-sm font-medium">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
                        {files.map((file) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {file.type.includes("image") && file.uploadStatus === "done" ? (
                                <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden border">
                                  <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                                </div>
                              ) : file.type.includes("image") ? (
                                <div className="h-10 w-10 shrink-0 rounded-md bg-muted flex items-center justify-center border">
                                  <Image className="h-5 w-5 text-muted-foreground" />
                                </div>
                              ) : (
                                <div className="h-10 w-10 shrink-0 rounded-md bg-primary/10 flex items-center justify-center border">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate cursor-pointer hover:text-primary" onClick={() => setPreviewFile(file)}>{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {file.pages} pages &middot; {(file.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {file.uploadStatus === "uploading" && (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              )}
                              {file.uploadStatus === "done" && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              )}
                              {file.uploadStatus === "error" && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => setPreviewFile(file)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" disabled={uploading} onClick={() => removeFile(file.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <HeartHandshake className="h-5 w-5 text-primary" /> Your Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        label="Full Name *"
                        placeholder="Your name"
                        {...form.register("customerName")}
                        error={form.formState.errors.customerName?.message}
                      />
                      <Input
                        label="Email *"
                        type="email"
                        placeholder="you@example.com"
                        {...form.register("customerEmail")}
                        error={form.formState.errors.customerEmail?.message}
                      />
                      <Input
                        label="Phone (optional)"
                        type="tel"
                        placeholder="+91 98765 43210"
                        {...form.register("customerPhone")}
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Printer className="h-5 w-5 text-primary" /> Print Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Copies</Label>
                          <Input type="number" min={1} {...form.register("copies", { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Paper Size</Label>
                          <Select value={values.paperSize} onValueChange={(v) => form.setValue("paperSize", v as "A4" | "A3" | "A5" | "Letter" | "Legal" | "Tabloid")}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["A4", "A3", "A5", "Letter", "Legal", "Tabloid"].map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Page Range</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={values.pageRange === "all" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => form.setValue("pageRange", "all")}
                          >
                            All Pages
                          </Button>
                          <Button
                            type="button"
                            variant={values.pageRange === "custom" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => form.setValue("pageRange", "custom")}
                          >
                            Custom Range
                          </Button>
                        </div>
                        {values.pageRange === "custom" && (
                          <Input
                            placeholder="e.g. 1-5, 7, 9-12"
                            className="mt-2"
                            {...form.register("customPageRange")}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Orientation</Label>
                          <Select value={values.orientation} onValueChange={(v) => form.setValue("orientation", v as "portrait" | "landscape")}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portrait">Portrait</SelectItem>
                              <SelectItem value="landscape">Landscape</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Select value={values.color} onValueChange={(v) => form.setValue("color", v as "Black & White" | "Color")}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Black & White">Black & White</SelectItem>
                              <SelectItem value="Color">Color</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Print Sides</Label>
                          <Select value={values.sides} onValueChange={(v) => form.setValue("sides", v as "Single Sided" | "Double Sided")}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Single Sided">Single Sided</SelectItem>
                              <SelectItem value="Double Sided">Double Sided</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Print Quality</Label>
                          <Select value={values.printQuality} onValueChange={(v) => form.setValue("printQuality", v as "draft" | "normal" | "high")}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <ScanLine className="h-5 w-5 text-primary" /> Finishing Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {finishingCheckboxes.map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all hover:border-primary/50 ${
                              finishingOptions.includes(item.id) ? "border-primary bg-primary/5" : ""
                            }`}
                          >
                            <Checkbox
                              checked={finishingOptions.includes(item.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  form.setValue("finishingOptions", [...finishingOptions, item.id])
                                } else {
                                  form.setValue("finishingOptions", finishingOptions.filter((o) => o !== item.id))
                                }
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">+{formatCurrency(item.price)}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-primary" /> Special Instructions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Any special requests or instructions for the print shop..."
                        className="min-h-[100px]"
                        {...form.register("notes")}
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Layout className="h-5 w-5 text-primary" /> Price Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-xl bg-muted/40 p-5 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {values.color} ({totalPages} pg x {formatCurrency(pricePerPage)})
                          </span>
                          <span>{formatCurrency(pricePerPage * totalPages)}</span>
                        </div>
                        {values.printQuality !== "normal" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Quality ({values.printQuality})</span>
                            <span>×{qualityMult}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Copies (×{values.copies})</span>
                          <span>{formatCurrency(printCost)}</span>
                        </div>
                        {finishingOptions.length > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Finishing ({finishingOptions.join(", ")})</span>
                            <span>{formatCurrency(finishingCost)}</span>
                          </div>
                        )}
                        <div className="border-t pt-3 flex justify-between items-baseline">
                          <span className="font-semibold">Total</span>
                          <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
                        </div>
                      </div>

                      <Button
                        className="w-full gap-2 mt-5 h-12 text-base"
                        size="lg"
                        onClick={handleSubmit}
                        disabled={uploading || files.length === 0}
                        loading={uploading}
                      >
                        {uploading ? "Uploading & Placing Order..." : connectedShop ? `Place Order at ${connectedShop.name}` : "Place Order"}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground mt-3">
                        By placing this order, you agree to the {APP_NAME} terms of service.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={showPaymentChoice} onOpenChange={(o) => { if (!o) { setShowPaymentChoice(false) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Choose Payment Method
            </DialogTitle>
            <DialogDescription>
              Total amount: {formatCurrency(paymentAmount)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Print Cost</span>
                <span>{formatCurrency(paymentAmount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-baseline">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(paymentAmount)}</span>
              </div>
            </div>
            <Button
              className="w-full gap-2 h-12 text-base"
              onClick={handlePayNow}
              disabled={paymentChoiceLoading}
              loading={paymentChoiceLoading}
            >
              <CreditCard className="h-5 w-5" /> Pay Now with Card
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 h-12 text-base"
              onClick={handlePayLater}
              disabled={paymentChoiceLoading}
            >
              Pay Later at Shop
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Pay later: settle the payment when you pick up your prints at the shop.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={(o) => { if (!o) { setPaymentDialogOpen(false); setClientSecret(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Complete Payment
            </DialogTitle>
            <DialogDescription>
              Pay {formatCurrency(paymentAmount)} to place your print order.
            </DialogDescription>
          </DialogHeader>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentFormComponent
                amount={paymentAmount}
                onSuccess={handlePaymentSuccess}
                onError={(msg) => toast.error(msg)}
                loading={paymentLoading}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewFile} onOpenChange={(o) => { if (!o) setPreviewFile(null) }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewFile?.type.includes("image") ? (
                <Image className="h-5 w-5 text-primary" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewFile?.type.includes("image") ? (
              <div className="flex items-center justify-center rounded-lg border bg-muted/30 p-4">
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-h-[400px] max-w-full rounded-lg object-contain shadow-sm"
                />
              </div>
            ) : previewFile?.type.includes("pdf") ? (
              <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/30 p-6 md:p-12">
                <FileText className="h-20 w-20 text-primary/40 mb-4" />
                <p className="text-lg font-medium">PDF Preview</p>
                <p className="text-sm text-muted-foreground mt-1">{previewFile.name}</p>
                <div className="flex gap-2 mt-4">
                  <a href={previewFile.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="default" size="sm">Open PDF</Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/30 p-6 md:p-12">
                <FileText className="h-20 w-20 text-primary/40 mb-4" />
                <p className="text-lg font-medium">Document Preview</p>
                <p className="text-sm text-muted-foreground mt-1">{previewFile?.name}</p>
                <a href={previewFile?.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="default" size="sm" className="mt-4">Download to View</Button>
                </a>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-muted-foreground text-xs">File size</p>
                <p className="font-medium">{previewFile ? (previewFile.size / 1024 / 1024).toFixed(1) : 0} MB</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-muted-foreground text-xs">Estimated pages</p>
                <p className="font-medium">{previewFile?.pages || 0} pages</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CustomerUploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <CustomerUploadContent />
    </Suspense>
  )
}

function PaymentFormComponent({ amount, onSuccess, onError, loading }: {
  amount: number
  onSuccess: () => void
  onError: (msg: string) => void
  loading: boolean
}) {
  const stripe = useStripe()
  const elements = useElements()

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    })

    if (error) {
      onError(error.message || "Payment failed")
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess()
    } else {
      onError(`Payment ${paymentIntent?.status}. Please try again.`)
    }
  }

  return (
    <form onSubmit={handlePayment} className="space-y-5">
      <PaymentElement />
      <Button type="submit" className="w-full h-12 text-base" disabled={!stripe || !elements} loading={loading}>
        Pay {formatCurrency(amount)}
      </Button>
    </form>
  )
}
