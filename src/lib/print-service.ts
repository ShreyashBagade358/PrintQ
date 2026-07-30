import { execFile } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"
import os from "os"
import { prisma } from "@/lib/prisma"

const execFileAsync = promisify(execFile)

export interface SystemPrinter {
  name: string
  status: "ONLINE" | "OFFLINE" | "BUSY" | "ERROR"
  model: string
  location?: string
  uri?: string
  paperLevel: number
  inkLevel: number
}

export interface PrintJobResult {
  jobId: string
  success: boolean
  error?: string
}

export interface PrintOptions {
  copies?: number
  sides?: "one-sided" | "two-sided-long-edge" | "two-sided-short-edge"
  color?: boolean
  paperSize?: string
  orientation?: "portrait" | "landscape"
  pageRanges?: string
  printQuality?: 3 | 4 | 5
  pagesPerSheet?: number
  fitToPage?: boolean
  scale?: number
  paperTray?: string
  brightness?: number
  contrast?: number
  colorMode?: "auto" | "color" | "grayscale" | "monochrome"
  shopId?: string
}

const TMP_DIR = path.join(os.tmpdir(), "printq-prints")

async function ensureTempDir() {
  try {
    await fs.mkdir(TMP_DIR, { recursive: true })
  } catch {
  }
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to download file")
  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(destPath, buffer)
}

function sanitizePrintInput(input: string): string {
  return input.replace(/[\x00-\x1f\x7f"'`\\]/g, "")
}

const VALID_SIDES = ["one-sided", "two-sided-long-edge", "two-sided-short-edge"]
const VALID_COLOR_MODES = ["auto", "color", "grayscale", "monochrome"]
const VALID_ORIENTATIONS = ["portrait", "landscape"]
const VALID_PAPER_SIZES = ["A4", "A3", "A5", "Letter", "Legal", "Executive", "Tabloid", "B5", "JIS"]
const VALID_PAPER_TRAYS = ["auto", "manual", "tray-1", "tray-2", "tray-3"]

async function findActivePrintServer(shopId?: string): Promise<{ token: string } | null> {
  if (!shopId) return null
  try {
    const server = await prisma.printServer.findFirst({
      where: {
        shopId,
        status: "ONLINE",
        lastSeen: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
      orderBy: { lastSeen: "desc" },
    })
    return server ? { token: server.token } : null
  } catch {
    return null
  }
}

async function printViaRemoteServer(
  token: string,
  printerName: string,
  fileUrl: string,
  fileName: string,
  options?: PrintOptions,
): Promise<PrintJobResult> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

    const response = await fetch(`${baseUrl}/api/print-server/jobs/push`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        printerName,
        fileUrl,
        fileName,
        options,
      }),
    })

    if (!response.ok) {
      return { jobId: "", success: false, error: "Failed to dispatch to print server" }
    }

    const result = await response.json() as { jobId?: string; error?: string }
    return {
      jobId: result.jobId || "remote-pending",
      success: true,
    }
  } catch {
    return { jobId: "", success: false, error: "Print server connection failed" }
  }
}

export async function discoverPrinters(): Promise<SystemPrinter[]> {
  try {
    const { stdout } = await execFileAsync("lpstat", ["-p", "-l"])
    const printers: SystemPrinter[] = []
    const lines = stdout.split("\n")
    let current: Partial<SystemPrinter> | null = null

    for (const line of lines) {
      const printerMatch = line.match(/^printer\s+(\S+)\s+is\s+(\S+)/)
      if (printerMatch) {
        if (current?.name) {
          printers.push({
            name: current.name,
            status: mapCupsStatus(current.status || "OFFLINE"),
            model: current.model || "Unknown",
            location: current.location,
            paperLevel: 100,
            inkLevel: 100,
          })
        }
        current = {
          name: printerMatch[1],
          status: mapCupsStatus(printerMatch[2]),
        }
        continue
      }
      const modelMatch = line.match(/^Model:\s+(.+)/i)
      if (modelMatch && current) {
        current.model = modelMatch[1].trim()
      }
      const locationMatch = line.match(/^Location:\s+(.+)/i)
      if (locationMatch && current) {
        current.location = locationMatch[1].trim()
      }
      const uriMatch = line.match(/^Device\s*URI:\s+(.+)/i)
      if (uriMatch && current) {
        current.uri = uriMatch[1].trim()
      }
    }

    if (current?.name) {
      printers.push({
        name: current.name,
        status: mapCupsStatus(current.status || "OFFLINE"),
        model: current.model || "Unknown",
        location: current.location,
        paperLevel: 100,
        inkLevel: 100,
      })
    }

    return printers
  } catch {
    return []
  }
}

function mapCupsStatus(status: string): SystemPrinter["status"] {
  switch (status.toLowerCase()) {
    case "idle":
      return "ONLINE"
    case "printing":
      return "BUSY"
    case "stopped":
      return "ERROR"
    default:
      return "OFFLINE"
  }
}

export async function getPrinterDetails(name: string): Promise<SystemPrinter | null> {
  const printers = await discoverPrinters()
  return printers.find((p) => p.name === name) || null
}

export async function printFile(
  printerName: string,
  fileUrl: string,
  fileName: string,
  options?: PrintOptions,
): Promise<PrintJobResult> {
  const server = await findActivePrintServer(options?.shopId)
  if (server) {
    return printViaRemoteServer(server.token, printerName, fileUrl, fileName, options)
  }

  return printViaLocalCups(printerName, fileUrl, fileName, options)
}

async function printViaLocalCups(
  printerName: string,
  fileUrl: string,
  fileName: string,
  options?: PrintOptions,
): Promise<PrintJobResult> {
  await ensureTempDir()

  const safeName = sanitizePrintInput(printerName)
  if (!safeName) return { jobId: "", success: false, error: "Invalid printer name" }

  const ext = path.extname(fileName) || ".pdf"
  const localPath = path.join(TMP_DIR, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)

  try {
    await downloadFile(fileUrl, localPath)

    const args: string[] = ["-d", safeName, localPath]

    if (options?.copies && options.copies > 1) {
      const copies = Math.floor(options.copies)
      if (copies > 0 && copies <= 999) args.push("-n", String(copies))
    }

    if (options?.sides && VALID_SIDES.includes(options.sides)) {
      args.push("-o", `sides=${options.sides}`)
    }

    if (options?.color === false && !options?.colorMode) {
      args.push("-o", "ColorModel=Gray")
    }
    if (options?.colorMode && VALID_COLOR_MODES.includes(options.colorMode)) {
      const modeMap: Record<string, string> = {
        color: "ColorModel=Color",
        grayscale: "ColorModel=Gray",
        monochrome: "ColorModel=(Black)",
        auto: "ColorModel=Auto",
      }
      args.push("-o", modeMap[options.colorMode])
    }

    if (options?.paperSize && VALID_PAPER_SIZES.includes(options.paperSize)) {
      args.push("-o", `media=${options.paperSize}`)
    }

    if (options?.orientation && VALID_ORIENTATIONS.includes(options.orientation)) {
      args.push("-o", `orientation-requested=${options.orientation === "landscape" ? "4" : "3"}`)
    }

    if (options?.pageRanges) {
      const safeRanges = sanitizePrintInput(options.pageRanges)
      if (/^[\d,\-\s]+$/.test(safeRanges)) {
        args.push("-o", `page-ranges=${safeRanges}`)
      }
    }

    if (options?.printQuality && [3, 4, 5].includes(options.printQuality)) {
      args.push("-o", `print-quality=${options.printQuality}`)
    }

    if (options?.pagesPerSheet && options.pagesPerSheet > 1 && options.pagesPerSheet <= 16) {
      args.push("-o", `number-up=${options.pagesPerSheet}`)
    }

    if (options?.fitToPage) {
      args.push("-o", "fit-to-page")
    }

    if (options?.scale && options.scale !== 100) {
      const scale = Math.max(25, Math.min(400, options.scale))
      args.push("-o", `scale=${scale}`)
    }

    if (options?.paperTray && VALID_PAPER_TRAYS.includes(options.paperTray)) {
      args.push("-o", `InputSlot=${options.paperTray}`)
    }

    if (options?.brightness !== undefined) {
      const brightness = Math.max(-100, Math.min(100, options.brightness))
      args.push("-o", `brightness=${brightness}`)
    }

    if (options?.contrast !== undefined) {
      const contrast = Math.max(-100, Math.min(100, options.contrast))
      args.push("-o", `contrast=${contrast}`)
    }

    const { stdout } = await execFileAsync("lp", args)

    const jobMatch = stdout.match(/request\s+id\s+is\s+(\S+)/i) ||
                     stdout.match(/job\s+id\s+[is]+\s+(\d+)/i) ||
                     stdout.match(/(\S+-\d+)/)

    return {
      jobId: jobMatch?.[1] || "unknown",
      success: true,
    }
  } catch {
    return {
      jobId: "",
      success: false,
      error: "Print job failed",
    }
  } finally {
    try {
      await fs.unlink(localPath).catch(() => {})
    } catch {
    }
  }
}

export async function cancelPrintJob(jobId: string): Promise<boolean> {
  try {
    const safeJobId = sanitizePrintInput(jobId)
    if (!safeJobId) return false
    await execFileAsync("cancel", [safeJobId])
    return true
  } catch {
    return false
  }
}

export async function holdPrintJob(jobId: string): Promise<boolean> {
  try {
    const safeJobId = sanitizePrintInput(jobId)
    if (!safeJobId) return false
    await execFileAsync("lp", ["-i", safeJobId, "-H", "hold"])
    return true
  } catch {
    return false
  }
}

export async function resumePrintJob(jobId: string): Promise<boolean> {
  try {
    const safeJobId = sanitizePrintInput(jobId)
    if (!safeJobId) return false
    await execFileAsync("lp", ["-i", safeJobId, "-H", "resume"])
    return true
  } catch {
    return false
  }
}

export async function getPrintQueue(): Promise<{ jobId: string; user: string; jobName: string; status: string }[]> {
  try {
    const { stdout } = await execFileAsync("lpq", [])
    const jobs: { jobId: string; user: string; jobName: string; status: string }[] = []
    const lines = stdout.split("\n")

    for (const line of lines) {
      const match = line.match(/^(\S+)\s+(\d+)\s+(\S+)\s+(.+)/)
      if (match) {
        jobs.push({
          jobId: `${match[1]}-${match[2]}`,
          user: match[3],
          jobName: match[4].trim(),
          status: "PRINTING",
        })
      }
    }

    return jobs
  } catch {
    return []
  }
}

export async function addPrinterToSystem(
  name: string,
  uri: string,
  model?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const safeName = sanitizePrintInput(name)
    const safeUri = sanitizePrintInput(uri)
    const safeModel = model ? sanitizePrintInput(model) : "drv:///sample.drv/generic.ppd"
    if (!safeName || !safeUri) return { success: false, error: "Invalid printer name or URI" }

    const args = ["-p", safeName, "-E", "-v", safeUri, "-m", safeModel]
    await execFileAsync("lpadmin", args)
    await execFileAsync("cupsenable", [safeName]).catch(() => {})
    await execFileAsync("cupsaccept", [safeName]).catch(() => {})
    return { success: true }
  } catch {
    return {
      success: false,
      error: "Failed to add printer",
    }
  }
}

export async function removePrinterFromSystem(name: string): Promise<boolean> {
  try {
    const safeName = sanitizePrintInput(name)
    if (!safeName) return false
    await execFileAsync("lpadmin", ["-x", safeName])
    return true
  } catch {
    return false
  }
}

export async function getPrinterOptions(name: string): Promise<Record<string, string[]>> {
  try {
    const safeName = sanitizePrintInput(name)
    if (!safeName) return {}
    const { stdout } = await execFileAsync("lpoptions", ["-p", safeName, "-l"])
    const options: Record<string, string[]> = {}
    for (const line of stdout.split("\n")) {
      const match = line.match(/^(\w+)\/(.+):\s+(.+)$/)
      if (match) {
        const values = match[3].split(/\s+/).map((v) => v.replace(/^\*/, ""))
        options[match[1]] = values
      }
    }
    return options
  } catch {
    return {}
  }
}
