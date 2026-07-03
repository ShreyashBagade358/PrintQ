import Link from "next/link"
import { ShieldX, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-orange-50/50 to-background p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 mb-6">
          <ShieldX className="h-10 w-10 text-orange-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">403</h1>
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-8">
          You don&apos;t have permission to access this page.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/login">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Sign In
            </Button>
          </Link>
          <Link href="/public/landing">
            <Button className="gap-2">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
