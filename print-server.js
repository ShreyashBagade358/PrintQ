#!/usr/bin/env node

const { execFile } = require("child_process")
const { promisify } = require("util")
const fs = require("fs")
const path = require("path")
const os = require("os")
const { Bonjour } = require("bonjour-service")
const ipp = require("ipp")

const execFileAsync = promisify(execFile)
const TMP_DIR = path.join(os.tmpdir(), "printq-prints")

const BASE_URL = process.env.PRINTQ_URL || "http://localhost:3000"
const TOKEN = process.env.PRINTQ_TOKEN
const NAME = process.env.PRINTQ_NAME || os.hostname()

if (!TOKEN) {
  console.error("Error: PRINTQ_TOKEN is required")
  console.error("")
  console.error("Usage:")
  console.error("  PRINTQ_URL=https://your-app.vercel.app \\")
  console.error("  PRINTQ_TOKEN=psk_xxx \\")
  console.error("  PRINTQ_NAME='Front Desk' \\")
  console.error("  node print-server.js")
  process.exit(1)
}

const IPP_DISCOVERY_MS = 8000
const DISCOVERY_PASSES = 3
const SYNC_INTERVAL_MS = 15_000
const IPP_ATTR_TTL_MS = 2 * 60_000

let polling = false
let syncing = false
let alive = true

function log(msg) {
  const ts = new Date().toISOString().slice(11, 19)
  console.log(`[${ts}] ${msg}`)
}

function sanitize(input) {
  return input.replace(/[\x00-\x1f\x7f"'`\\]/g, "")
}

async function printFile(printerName, fileUrl, fileName) {
  await fs.promises.mkdir(TMP_DIR, { recursive: true }).catch(() => {})

  const safeName = sanitize(printerName)
  if (!safeName) throw new Error("Invalid printer name")

  const ext = path.extname(fileName) || ".pdf"
  const localPath = path.join(TMP_DIR, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)

  try {
    const res = await fetch(fileUrl)
    if (!res.ok) throw new Error(`Download failed: ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    await fs.promises.writeFile(localPath, buffer)

    const { stdout } = await execFileAsync("lp", ["-d", safeName, localPath])

    const match = stdout.match(/request\s+id\s+is\s+(\S+)/i)
    return match?.[1] || "unknown"
  } finally {
    await fs.promises.unlink(localPath).catch(() => {})
  }
}

// ---------------------------------------------------------------------------
// Printer discovery: Bonjour (mDNS) first, CUPS (lpstat) as fallback
// ---------------------------------------------------------------------------

const bonjour = new Bonjour()
const ippAttrCache = new Map()

function queryIppAttributes(uri, timeoutMs = 4000) {
  return new Promise((resolve) => {
    let settled = false
    const done = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }
    const timer = setTimeout(() => done(null), timeoutMs)
    try {
      const printer = ipp.Printer(uri)
      printer.execute(
        "Get-Printer-Attributes",
        {
          "operation-attributes-tag": {
            "attributes-charset": "utf-8",
            "attributes-natural-language": "en",
            "printer-uri": uri,
          },
        },
        (err, res) => {
          if (err) return done(null)
          done(res)
        }
      )
    } catch {
      done(null)
    }
  })
}

async function getIppAttributes(uri) {
  const cached = ippAttrCache.get(uri)
  if (cached && Date.now() - cached.ts < IPP_ATTR_TTL_MS) return cached.value
  const attrs = await queryIppAttributes(uri)
  const value = attrs?.["printer-attributes-tag"] || null
  ippAttrCache.set(uri, { value, ts: Date.now() })
  return value
}

function mapIppState(state) {
  // IPP printer-state can be a number (3=idle, 4=processing, 5=stopped)
  // or a keyword string ("idle", "processing", "stopped")
  if (typeof state === "string") {
    const s = state.toLowerCase()
    if (s === "idle") return "ONLINE"
    if (s === "processing") return "BUSY"
    if (s === "stopped") return "ERROR"
    return "OFFLINE"
  }
  if (state === 3) return "ONLINE"
  if (state === 4) return "BUSY"
  if (state === 5) return "ERROR"
  return "OFFLINE"
}

function mediaToPaperSizes(media) {
  if (!Array.isArray(media)) return []
  const sizes = new Set()
  for (const m of media) {
    if (/^iso_a4/i.test(m)) sizes.add("A4")
    else if (/^iso_a3/i.test(m)) sizes.add("A3")
    else if (/^iso_a5/i.test(m)) sizes.add("A5")
    else if (/^na_letter/i.test(m)) sizes.add("Letter")
    else if (/^na_legal/i.test(m)) sizes.add("Legal")
  }
  return Array.from(sizes)
}

async function discoverBonjourPrinters() {
  const raw = new Map()
  const seenAt = new Map()

  const record = (type, service) => {
    const key = `${type}:${service.fqdn || service.name}`
    raw.set(key, { type, service })
    seenAt.set(key, Date.now())
  }

  for (let pass = 0; pass < DISCOVERY_PASSES; pass++) {
    const entries = await new Promise((resolve) => {
      const ippBrowse = bonjour.find({ type: "ipp" }, (s) => record("ipp", s))
      const printerBrowse = bonjour.find({ type: "printer" }, (s) => record("printer", s))
      ippBrowse.start()
      printerBrowse.start()
      setTimeout(() => {
        try { ippBrowse.stop(); printerBrowse.stop() } catch {}
        resolve()
      }, IPP_DISCOVERY_MS)
    })
    void entries
  }

  // Prune entries that stopped announcing (gone off the network)
  const cutoff = Date.now() - 3 * 60_000
  for (const [key, ts] of seenAt) {
    if (ts < cutoff) {
      raw.delete(key)
      seenAt.delete(key)
    }
  }

  // IPP entries (port 631) take priority; LPD-only printers fill gaps.
  const final = new Map()
  for (const { type, service } of raw.values()) {
    const entry = buildEntry(type, service)
    const key = entry.name.toLowerCase()
    if (type === "ipp") {
      final.set(key, Object.assign(final.get(key) || {}, entry, { source: "bonjour-ipp" }))
    } else if (!final.has(key)) {
      final.set(key, entry)
    }
  }

  const printers = Array.from(final.values())

  // Enrich with IPP attributes (state, real capabilities, marker levels)
  await Promise.all(
    printers.map(async (p) => {
      if (!p.uri) return
      const a = await getIppAttributes(p.uri)
      if (!a) return

      if (a["printer-state"] !== undefined) p.status = mapIppState(a["printer-state"])

      const makeModel = a["printer-make-and-model"]
      if (makeModel && String(makeModel) !== "Unknown") p.model = String(makeModel)

      const color = a["color-supported"]
      if (color !== undefined) p.capabilities.color = color === true || color === "true"

      const sides = a["sides-supported"]
      if (Array.isArray(sides) && sides.some((s) => String(s).startsWith("two-sided"))) {
        p.capabilities.duplex = true
      }

      const media = a["media-supported"]
      const sizes = mediaToPaperSizes(media)
      if (sizes.length) p.capabilities.paperSizes = sizes

      const levels = a["marker-levels"]
      if (levels !== undefined) {
        const nums = Array.isArray(levels) ? levels.map(Number) : [Number(levels)]
        const valid = nums.filter((n) => Number.isFinite(n))
        p.inkLevel = valid.length ? Math.round(valid.reduce((x, y) => x + y, 0) / valid.length) : null
      }
    })
  )

  return printers
}

async function discoverCupsPrinters() {
  const printers = []
  try {
    const { stdout } = await execFileAsync("lpstat", ["-p", "-l"])
    const lines = stdout.split("\n")
    let current = null

    for (const line of lines) {
      const printerMatch = line.match(/^printer\s+(\S+)\s+is\s+(\S+)/)
      if (printerMatch) {
        if (current?.name) printers.push(current)
        current = {
          name: printerMatch[1],
          status: mapCupsStatus(printerMatch[2]),
          model: "Unknown",
          ip: null,
          uri: null,
          capabilities: { color: true, duplex: true, paperSizes: ["A4", "Letter"] },
          inkLevel: null,
          paperLevel: null,
          source: "cups",
        }
        continue
      }
      if (!current) continue
      const modelMatch = line.match(/^Model:\s+(.+)/i)
      if (modelMatch) current.model = modelMatch[1].trim()
      const uriMatch = line.match(/^Device\s*URI:\s+(.+)/i)
      if (uriMatch) {
        current.uri = uriMatch[1].trim()
        const ipMatch = current.uri.match(/(\d+\.\d+\.\d+\.\d+)/)
        if (ipMatch) current.ip = ipMatch[1]
      }
    }
    if (current?.name) printers.push(current)
  } catch {
    // lpstat not available (e.g. Windows) — Bonjour already covers IPP printers
  }
  return printers
}

function mapCupsStatus(status) {
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

function buildEntry(type, service) {
  const name = service.name
  const addr = service.addresses?.[0] || service.host || null
  const txt = service.txt || {}
  const rp = String(txt.rp || "").replace(/^\/+/, "")

  const entry = {
    name,
    status: "ONLINE",
    model: txt.ty || txt.product || name,
    ip: addr,
    uri: null,
    port: service.port || null,
    capabilities: { color: true, duplex: true, paperSizes: ["A4", "Letter"] },
    inkLevel: null,
    paperLevel: null,
    source: type === "ipp" ? "bonjour-ipp" : "bonjour",
  }

  if (addr) {
    if (type === "ipp") {
      entry.uri = `ipp://${addr}:${service.port || 631}/${rp || "ipp/print"}`
    } else {
      entry.uri = `lpd://${addr}/${rp || "auto"}`
    }
  }

  return entry
}

async function discoverPrinters() {
  const [bonjourPrinters, cupsPrinters] = await Promise.all([
    discoverBonjourPrinters(),
    discoverCupsPrinters(),
  ])

  const merged = [...bonjourPrinters]
  const seen = new Set(bonjourPrinters.map((p) => p.name.toLowerCase()))
  for (const cup of cupsPrinters) {
    if (!seen.has(cup.name.toLowerCase())) {
      merged.push(cup)
      seen.add(cup.name.toLowerCase())
    }
  }

  return merged
}

// ---------------------------------------------------------------------------
// Cloud sync
// ---------------------------------------------------------------------------

async function syncPrinters() {
  if (syncing || !alive) return
  syncing = true
  try {
    const printers = await discoverPrinters()
    log(`Discovered ${printers.length} printer(s): ${printers.map((p) => p.name).join(", ") || "none"}`)
    const res = await fetch(`${BASE_URL}/api/print-server/printers/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ printers }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) log(`Sync failed: HTTP ${res.status}`)
  } catch {
    log("Sync error: cloud unreachable")
  } finally {
    syncing = false
  }
}

// ---------------------------------------------------------------------------
// Job polling (unchanged behavior)
// ---------------------------------------------------------------------------

async function heartbeat() {
  try {
    await fetch(`${BASE_URL}/api/print-server/heartbeat`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: AbortSignal.timeout(5000),
    })
  } catch {}
}

async function pollJobs() {
  if (polling || !alive) return
  polling = true

  try {
    const res = await fetch(`${BASE_URL}/api/print-server/jobs/dispatch`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) return
    const { jobs } = await res.json()
    if (!jobs?.length) return

    for (const job of jobs) {
      log(`Printing: ${job.fileName} -> ${job.printerName}`)

      const statusUpdate = async (status, extra = {}) => {
        await fetch(`${BASE_URL}/api/print-server/jobs/${job.id}/status`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, ...extra }),
          signal: AbortSignal.timeout(5000),
        }).catch(() => {})
      }

      await statusUpdate("PRINTING")

      try {
        const cupsJobId = await printFile(job.printerName, job.fileUrl, job.fileName)
        log(`Done: ${job.fileName} (CUPS job: ${cupsJobId})`)
        await statusUpdate("COMPLETED", { jobId: cupsJobId })
      } catch (e) {
        log(`Failed: ${job.fileName} - ${e.message}`)
        await statusUpdate("FAILED", { error: e.message })
      }
    }
  } catch (e) {
    if (e.name !== "AbortError") log(`Poll error: ${e.message}`)
  } finally {
    polling = false
  }
}

async function main() {
  log(`PrintQ Print Server`)
  log(`Server: ${BASE_URL}`)
  log(`Name: ${NAME}`)
  log(`Waiting for jobs...`)

  try {
    await heartbeat()
    await syncPrinters()
  } catch (e) {
    log(`Startup sync failed: ${e.message}`)
  }
  setInterval(heartbeat, 30_000)
  setInterval(syncPrinters, SYNC_INTERVAL_MS)
  setInterval(pollJobs, 2_000)

  const shutdown = () => {
    alive = false
    log("Shutting down...")
    process.exit(0)
  }
  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}

if (require.main === module) {
  main()
} else {
  module.exports = { discoverPrinters, discoverBonjourPrinters, discoverCupsPrinters }
}
