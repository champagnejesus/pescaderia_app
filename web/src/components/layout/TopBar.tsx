"use client"

interface TopBarProps {
  title: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
}

export function TopBar({ title, leftAction, rightAction }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30">
      <div className="absolute inset-0 bg-abyssal-surface glass-subtle border-b border-abyssal-outline/30" />
      <div className="relative max-w-[480px] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-[40px]">
          {leftAction}
        </div>
        <h1 className="text-title-large text-abyssal-text-primary flex-1 text-center font-semibold">{title}</h1>
        <div className="flex items-center gap-2 min-w-[40px] justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  )
}
