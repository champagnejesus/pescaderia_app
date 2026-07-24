"use client"
import { ThemeToggle } from "./ThemeToggle"

interface TopBarProps {
  title: string
  icon?: React.ReactNode
  subtitle?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
}

export function TopBar({ title, icon, subtitle, leftAction, rightAction }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 lg:hidden">
      <div className="absolute inset-0 bg-abyssal-surface/90 backdrop-blur-2xl border-b border-abyssal-outline" />
      <div className="relative flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-[40px]">
          {leftAction}
        </div>
        <div className="flex items-center gap-2">
          {icon && <span className="text-abyssal-primary">{icon}</span>}
          <div>
            <h1 className="text-title-medium text-abyssal-text-primary font-heading font-semibold">{title}</h1>
            {subtitle && <p className="text-[11px] text-abyssal-text-secondary-variant font-body">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 min-w-[40px] justify-end">
          {rightAction}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}