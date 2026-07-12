"use client"

import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

export function TutorialButton() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("start-tutorial"))
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={handleClick}
      title="Replay tutorial"
    >
      <HelpCircle className="h-5 w-5" />
    </Button>
  )
}
