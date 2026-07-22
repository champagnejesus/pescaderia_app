"use client"

import { Sun, Moon } from "lucide-react"
import { useThemeStore } from "@/store/themeStore"

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)

  return (
    <button
      onClick={toggle}
      className="text-abyssal-text-secondary hover:text-abyssal-text-primary transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
