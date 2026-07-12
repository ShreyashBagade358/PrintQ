"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Joyride, STATUS } from "react-joyride"
import type { EventData } from "react-joyride"
import { customerTourSteps, shopTourSteps } from "./tour-configs"

export function TutorialProvider() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const [run, setRun] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const storageKey = role === "CUSTOMER" ? "printq-tour-customer" : role === "SHOP_OWNER" ? "printq-tour-shop" : null

  useEffect(() => {
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded || !storageKey) return
    const seen = localStorage.getItem(storageKey)
    if (!seen) {
      const timer = setTimeout(() => setRun(true), 600)
      return () => clearTimeout(timer)
    }
  }, [loaded, storageKey])

  useEffect(() => {
    const handler = () => setRun(true)
    window.addEventListener("start-tutorial", handler)
    return () => window.removeEventListener("start-tutorial", handler)
  }, [])

  const handleEvent = useCallback(
    (data: EventData) => {
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        if (storageKey) localStorage.setItem(storageKey, "true")
        setRun(false)
      }
    },
    [storageKey],
  )

  if (!storageKey) return null

  const steps = role === "CUSTOMER" ? customerTourSteps : shopTourSteps

  if (!loaded) return null

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      options={{
        showProgress: true,
        skipBeacon: true,
        buttons: ["close", "primary", "skip"],
        primaryColor: "hsl(221.2 83.2% 53.3%)",
        textColor: "hsl(222.2 84% 4.9%)",
        backgroundColor: "hsl(0 0% 100%)",
        arrowColor: "hsl(0 0% 100%)",
        overlayColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
      }}
      locale={{
        skip: "Skip tour",
        next: "Next",
        last: "Done",
      }}
      styles={{
        tooltip: {
          borderRadius: "0.75rem",
          padding: "1.25rem",
          fontSize: "0.875rem",
        },
        tooltipTitle: {
          fontSize: "1.125rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        },
        buttonSkip: {
          color: "hsl(215.4 16.3% 46.9%)",
          fontWeight: 500,
          fontSize: "0.8rem",
        },
        buttonPrimary: {
          borderRadius: "0.5rem",
          fontWeight: 600,
          fontSize: "0.8rem",
          padding: "0.5rem 1rem",
        },
      }}
      onEvent={handleEvent}
    />
  )
}
