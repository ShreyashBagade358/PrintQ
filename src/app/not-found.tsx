import Link from "next/link"
import { FileQuestion, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-blue-50/50 to-background p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 mb-6">
          <FileQuestion className="h-10 w-10 text-blue-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">404</h1>
        <h2 className="text-xl font-semibold mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/public/landing">
          <Button className="gap-2">
            <Home className="h-4 w-4" /> Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
