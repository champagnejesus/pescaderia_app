"use client"

import { Bell } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="bg-abyssal-surface px-4 py-3 flex items-center justify-between">
      <h1 className="text-title-large text-abyssal-text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="text-abyssal-text-secondary hover:text-abyssal-text-primary transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  )
}
