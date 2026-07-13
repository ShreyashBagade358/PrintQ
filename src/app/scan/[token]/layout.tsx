import { ScanTokenLayoutClient } from "./scan-token-layout-client"

export default function ScanTokenLayout({ children }: { children: React.ReactNode }) {
  return <ScanTokenLayoutClient>{children}</ScanTokenLayoutClient>
}
