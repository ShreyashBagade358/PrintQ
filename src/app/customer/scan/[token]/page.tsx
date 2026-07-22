import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { verifyShopQrAction, recordScanAction } from "@/lib/actions/qr.actions"
import { AlertCircle, ArrowLeft, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  params: Promise<{ token: string }>
}

export default async function ScanTokenPage({ params }: Props) {
  const { token } = await params
  const session = await auth()
  const result = await verifyShopQrAction(token)

  if (!result.valid || !result.shop) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md w-full">
          <CardContent className="p-4 sm:p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold">Invalid QR Code</h1>
            <p className="text-muted-foreground">{result.error || "This QR code could not be verified."}</p>
            <div className="pt-2 space-y-2">
              <Link href="/customer/scan"><Button variant="default" className="w-full gap-2"><QrCode className="h-4 w-4" /> Try Again</Button></Link>
              <Link href="/public/landing"><Button variant="outline" className="w-full gap-2"><ArrowLeft className="h-4 w-4" /> Go Home</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shop = result.shop

  if (!session?.user) {
    const callbackUrl = `/scan/${token}`
    redirect(`/auth/customer-login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  if (session.user.role !== "CUSTOMER") {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md w-full">
          <CardContent className="p-4 sm:p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold">Wrong Account Type</h1>
            <p className="text-muted-foreground">Please sign in as a customer to connect with this shop.</p>
            <Link href={`/auth/customer-login?callbackUrl=${encodeURIComponent(`/scan/${token}`)}`}>
              <Button className="w-full">Sign in as Customer</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  recordScanAction(shop.id, token)

  // Store connection so the dashboard can show "Connected to X shop"
  const uploadUrl = `/customer/upload?connectedShop=${shop.id}&shopName=${encodeURIComponent(shop.name)}&fromScan=true`
  redirect(uploadUrl)
}
