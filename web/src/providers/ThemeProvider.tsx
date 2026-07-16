"use client"
import { useEffect } from "react"
import { useThemeStore } from "@/store/themeStore"
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme); const setTheme = useThemeStore((s) => s.setTheme)
  useEffect(() => { const saved = localStorage.getItem("abyssal-theme") as "dark" | "light" | null; if (saved) setTheme(saved) }, [setTheme])
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark") }, [theme])
  return <>{children}</>
}
