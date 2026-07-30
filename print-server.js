#!/usr/bin/env node

const { execFile } = require("child_process")
const { promisify } = require("util")
const fs = require("fs")
const path = require("path")
const os = require("os")

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

let polling = false
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

  await heartbeat()
  setInterval(heartbeat, 30_000)
  setInterval(pollJobs, 2_000)

  const shutdown = () => {
    alive = false
    log("Shutting down...")
    process.exit(0)
  }
  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}

main()
