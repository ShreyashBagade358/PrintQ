import { ScanLayoutClient } from "./scan-layout-client"

export const metadata = { title: "Scan Shop QR - PrintQ" }

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return <ScanLayoutClient>{children}</ScanLayoutClient>
}
