"use client"

import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home, ArrowLeft, HeadphonesIcon } from "lucide-react"

const errorPages = [
  {
    code: "404",
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
    illustration: "🔍",
  },
  {
    code: "500",
    title: "Internal Server Error",
    description: "Something went wrong on our end. Please try again later.",
    illustration: "⚙️",
  },
  {
    code: "403",
    title: "Access Denied",
    description: "You don't have permission to access this page.",
    illustration: "🚫",
  },
  {
    code: "503",
    title: "Service Unavailable",
    description: "We're down for maintenance. We'll be back shortly.",
    illustration: "🛠️",
  },
]

function ErrorPageContent({ code, title, description, illustration }: typeof errorPages[0]) {
  return (
    <>
      <PublicNavbar />
      <main className="flex items-center justify-center px-4 py-20 min-h-[80vh]">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">{illustration}</div>
          <h1 className="text-6xl font-bold text-primary">{code}</h1>
          <h2 className="text-2xl font-bold mt-4">{title}</h2>
          <p className="mt-2 text-muted-foreground">{description}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/public/landing">
              <Button className="gap-2"><Home className="h-4 w-4" /> Go Home</Button>
            </Link>
            <Link href="javascript:history.back()">
              <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Go Back</Button>
            </Link>
            <Link href="/public/contact">
              <Button variant="ghost" className="gap-2"><HeadphonesIcon className="h-4 w-4" /> Support</Button>
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}

export default function System404Page() {
  const page = errorPages[0]
  return <ErrorPageContent {...page} />
}
