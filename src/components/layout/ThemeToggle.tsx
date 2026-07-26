"use client"

import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("abyssal-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = stored ? stored === "dark" : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
    setMounted(true)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("abyssal-theme", next ? "dark" : "light")
  }

  if (!mounted) {
    return (
      <button
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          "text-abyssal-text-secondary-variant",
          className
        )}
        aria-label="Cambiar tema"
      >
        <div className="w-4 h-4 rounded-full bg-abyssal-text-secondary-variant/30 animate-pulse" />
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center",
        "hover:bg-abyssal-surface-highest transition-all duration-200 active:scale-95",
        dark ? "text-abyssal-yellow" : "text-abyssal-text-secondary",
        className
      )}
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
      title={dark ? "Modo claro" : "Modo oscuro"}
    >
      {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  )
}