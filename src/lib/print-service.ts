import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"
import os from "os"

const execAsync = promisify(exec)

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
  if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(destPath, buffer)
}

export async function discoverPrinters(): Promise<SystemPrinter[]> {
  try {
    const { stdout } = await execAsync("lpstat -p -l 2>/dev/null || true")
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
  await ensureTempDir()

  const ext = path.extname(fileName) || ".pdf"
  const localPath = path.join(TMP_DIR, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)

  try {
    await downloadFile(fileUrl, localPath)

    let cmd = `lp -d "${printerName}" "${localPath}"`

    if (options?.copies && options.copies > 1) {
      cmd += ` -n ${options.copies}`
    }

    if (options?.sides) {
      cmd += ` -o sides=${options.sides}`
    }

    if (options?.color === false && !options?.colorMode) {
      cmd += " -o ColorModel=Gray"
    }
    if (options?.colorMode) {
      const modeMap: Record<string, string> = {
        color: "ColorModel=Color",
        grayscale: "ColorModel=Gray",
        monochrome: "ColorModel=(Black)",
        auto: "ColorModel=Auto",
      }
      cmd += ` -o ${modeMap[options.colorMode] || "ColorModel=Color"}`
    }

    if (options?.paperSize) {
      cmd += ` -o media=${options.paperSize}`
    }

    if (options?.orientation === "landscape") {
      cmd += " -o orientation-requested=4"
    } else if (options?.orientation === "portrait") {
      cmd += " -o orientation-requested=3"
    }

    if (options?.pageRanges) {
      cmd += ` -o page-ranges=${options.pageRanges}`
    }

    if (options?.printQuality) {
      cmd += ` -o print-quality=${options.printQuality}`
    }

    if (options?.pagesPerSheet && options.pagesPerSheet > 1) {
      cmd += ` -o number-up=${options.pagesPerSheet}`
    }

    if (options?.fitToPage) {
      cmd += " -o fit-to-page"
    }

    if (options?.scale && options.scale !== 100) {
      cmd += ` -o scale=${options.scale}`
    }

    if (options?.paperTray) {
      cmd += ` -o InputSlot=${options.paperTray}`
    }

    if (options?.brightness !== undefined) {
      cmd += ` -o brightness=${options.brightness}`
    }

    if (options?.contrast !== undefined) {
      cmd += ` -o contrast=${options.contrast}`
    }

    cmd += " 2>&1"

    const { stdout } = await execAsync(cmd)

    const jobMatch = stdout.match(/request\s+id\s+is\s+(\S+)/i) ||
                     stdout.match(/job\s+id\s+[is]+\s+(\d+)/i) ||
                     stdout.match(/(\S+-\d+)/)

    return {
      jobId: jobMatch?.[1] || "unknown",
      success: true,
    }
  } catch (e) {
    return {
      jobId: "",
      success: false,
      error: e instanceof Error ? e.message : "Print failed",
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
    await execAsync(`cancel ${jobId} 2>/dev/null || true`)
    return true
  } catch {
    return false
  }
}

export async function holdPrintJob(jobId: string): Promise<boolean> {
  try {
    await execAsync(`lp -i ${jobId} -H hold 2>/dev/null || true`)
    return true
  } catch {
    return false
  }
}

export async function resumePrintJob(jobId: string): Promise<boolean> {
  try {
    await execAsync(`lp -i ${jobId} -H resume 2>/dev/null || true`)
    return true
  } catch {
    return false
  }
}

export async function getPrintQueue(): Promise<{ jobId: string; user: string; jobName: string; status: string }[]> {
  try {
    const { stdout } = await execAsync("lpq 2>/dev/null || echo ''")
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
    const modelPpd = model || "drv:///sample.drv/generic.ppd"
    const cmd = `lpadmin -p "${name}" -E -v "${uri}" -m "${modelPpd}" 2>&1`
    await execAsync(cmd)
    await execAsync(`cupsenable "${name}" 2>/dev/null || true`)
    await execAsync(`cupsaccept "${name}" 2>/dev/null || true`)
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to add printer",
    }
  }
}

export async function removePrinterFromSystem(name: string): Promise<boolean> {
  try {
    await execAsync(`lpadmin -x "${name}" 2>/dev/null || true`)
    return true
  } catch {
    return false
  }
}

export async function getPrinterOptions(name: string): Promise<Record<string, string[]>> {
  try {
    const { stdout } = await execAsync(`lpoptions -p "${name}" -l 2>/dev/null || true`)
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
