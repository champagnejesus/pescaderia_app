"use client"

interface TopBarProps {
  title: string
  icon?: React.ReactNode
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
}

export function TopBar({ title, icon, leftAction, rightAction }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 lg:hidden">
      <div className="absolute inset-0 bg-abyssal-surface/85 backdrop-blur-2xl border-b border-abyssal-outline/20" />
      <div className="relative flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-[40px]">
          {leftAction}
        </div>
        <h1 className="flex items-center gap-2 text-title-medium text-abyssal-text-primary font-semibold">
          {icon && <span className="text-abyssal-primary">{icon}</span>}
          {title}
        </h1>
        <div className="flex items-center gap-1 min-w-[40px] justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  )
}
