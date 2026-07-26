"use client"
import { useEffect } from "react"
import { useThemeStore } from "@/store/themeStore"

if (typeof Number !== "undefined" && Number.prototype.toLocaleString) {
  const originalToLocaleString = Number.prototype.toLocaleString
  Number.prototype.toLocaleString = function (locale, options) {
    return originalToLocaleString.call(this, "es-CL", {
      ...options,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  // Sync store with localStorage on mount (inline script in layout.tsx already set initial class)
  useEffect(() => {
    const saved = localStorage.getItem("abyssal-theme") as "dark" | "light" | null
    if (saved && saved !== theme) setTheme(saved)
  }, [theme, setTheme])

  // Apply theme class changes to document
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return <>{children}</>
}