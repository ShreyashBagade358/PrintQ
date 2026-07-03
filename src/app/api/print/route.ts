import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  discoverPrinters,
  printFile,
  getPrintQueue,
  addPrinterToSystem,
  removePrinterFromSystem,
  getPrinterDetails,
} from "@/lib/print-service"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action") || "discover"
  const printerName = searchParams.get("printer")

  try {
    switch (action) {
      case "discover": {
        const printers = await discoverPrinters()
        return NextResponse.json({ printers })
      }
      case "details": {
        if (!printerName) return NextResponse.json({ error: "printer name required" }, { status: 400 })
        const details = await getPrinterDetails(printerName)
        if (!details) return NextResponse.json({ error: "Printer not found" }, { status: 404 })
        return NextResponse.json(details)
      }
      case "queue": {
        const queue = await getPrintQueue()
        return NextResponse.json({ queue })
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case "print": {
        const { printerName, fileUrl, fileName, copies, sides, color, paperSize } = body
        if (!printerName || !fileUrl || !fileName) {
          return NextResponse.json({ error: "printerName, fileUrl, fileName required" }, { status: 400 })
        }
        const result = await printFile(printerName, fileUrl, fileName, {
          copies,
          sides,
          color,
          paperSize,
        })
        return NextResponse.json(result)
      }

      case "add-printer": {
        const { name, uri, model } = body
        if (!name || !uri) {
          return NextResponse.json({ error: "name and uri required" }, { status: 400 })
        }
        const result = await addPrinterToSystem(name, uri, model)
        return NextResponse.json(result)
      }

      case "remove-printer": {
        const { name } = body
        if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })
        const success = await removePrinterFromSystem(name)
        return NextResponse.json({ success })
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 },
    )
  }
}
