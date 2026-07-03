import Link from "next/link"
import { Printer } from "lucide-react"

const footerLinks = {
  Product: [
    { href: "/public/pricing", label: "Pricing" },
    { href: "/public/landing#features", label: "Features" },
    { href: "/public/landing#how-it-works", label: "How It Works" },
    { href: "/auth/register", label: "Get Started" },
  ],
  Company: [
    { href: "/public/about", label: "About" },
    { href: "/public/blog", label: "Blog" },
    { href: "/public/contact", label: "Contact" },
    { href: "/public/help", label: "Help Center" },
  ],
  Legal: [
    { href: "/legal/privacy", label: "Privacy Policy" },
    { href: "/legal/terms", label: "Terms of Service" },
    { href: "/legal/refund", label: "Refund Policy" },
    { href: "/legal/security", label: "Security" },
  ],
  Support: [
    { href: "/public/help", label: "Help Center" },
    { href: "/public/contact", label: "Contact Us" },
    { href: "/system/coming-soon", label: "Status" },
  ],
}

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4">
            <Link href="/public/landing" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Printer className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">PrintQ</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The cloud-based print shop management platform. Print smarter, not harder.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PrintQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
