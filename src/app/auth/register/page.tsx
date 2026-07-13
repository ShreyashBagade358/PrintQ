"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Printer, ArrowLeft, ArrowRight, Eye, EyeOff, Building2, Loader2 } from "lucide-react"
import { registerAction } from "@/lib/actions/auth.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [shopName, setShopName] = useState("")
  const [shopSlug, setShopSlug] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [pinCode, setPinCode] = useState("")
  const [shopPhone, setShopPhone] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    const result = await registerAction(undefined, formData)
    setPending(false)
    if (result.success) {
      router.push(result.redirect || "/shop/dashboard")
    } else {
      toast.error(result.error || "Registration failed")
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-blue-500/5 to-background items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="rounded-2xl bg-white/50 backdrop-blur-sm p-8 shadow-xl">
            <Building2 className="mx-auto h-16 w-16 text-primary" />
            <h3 className="mt-6 text-2xl font-bold">Start your print shop journey</h3>
            <p className="mt-2 text-muted-foreground">
              Join 500+ print shops already using PrintQ to streamline their operations.
            </p>
            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</div>
                <p className="text-sm text-muted-foreground">Enter your shop details</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</div>
                <p className="text-sm text-muted-foreground">Create your owner account</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</div>
                <p className="text-sm text-muted-foreground">Start accepting orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/public/landing" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Printer className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">PrintQ</span>
            </Link>
          </div>

          <div className="mb-8 flex items-center justify-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}>1</div>
            <div className={`h-0.5 w-12 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}>2</div>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">Shop Details</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Tell us about your print shop</p>
                  </div>

                  <Input label="Shop Name" name="shopName" placeholder="e.g. PrintPro Delhi" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
                  <Input label="Shop URL" name="shopSlug" placeholder="e.g. printpro-delhi" value={shopSlug} onChange={(e) => setShopSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))} required />
                  <Input label="Address" name="address" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="City" name="city" placeholder="Delhi" value={city} onChange={(e) => setCity(e.target.value)} required />
                    <Input label="State" name="state" placeholder="Delhi" value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="PIN Code" name="pinCode" placeholder="110001" value={pinCode} onChange={(e) => setPinCode(e.target.value)} required />
                    <Input label="Shop Phone" name="shopPhone" type="tel" placeholder="+91 98765 43210" value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} required />
                  </div>

                  <Button className="w-full gap-2" size="lg" type="button" onClick={() => setStep(2)}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <input type="hidden" name="shopName" value={shopName} />
                  <input type="hidden" name="shopSlug" value={shopSlug} />
                  <input type="hidden" name="address" value={address} />
                  <input type="hidden" name="city" value={city} />
                  <input type="hidden" name="state" value={state} />
                  <input type="hidden" name="pinCode" value={pinCode} />
                  <input type="hidden" name="shopPhone" value={shopPhone} />

                  <div className="text-center">
                    <h1 className="text-2xl font-bold">Owner Details</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Create your account</p>
                  </div>

                  <Input label="Full Name" name="name" placeholder="John Doe" required />
                  <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
                  <Input label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" />
                  <div className="relative">
                    <Input
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm your password" required />

                  <div className="flex items-start gap-2">
                    <Checkbox id="terms" className="mt-1" required />
                    <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the{" "}
                      <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>
                      {" "}and{" "}
                      <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" type="button" onClick={() => setStep(1)} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button className="flex-1" size="lg" type="submit" disabled={pending}>
                      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Create Account
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
