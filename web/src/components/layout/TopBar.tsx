"use client"

interface TopBarProps {
  title: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
}

export function TopBar({ title, leftAction, rightAction }: TopBarProps) {
  return (
    <header className="bg-abyssal-surface px-4 py-3 flex items-center justify-between border-b border-abyssal-outline/50">
      <div className="flex items-center gap-2 min-w-[40px]">
        {leftAction}
      </div>
      <h1 className="text-title-large text-abyssal-text-primary flex-1 text-center">{title}</h1>
      <div className="flex items-center gap-2 min-w-[40px] justify-end">
        {rightAction}
      </div>
    </header>
  )
}
