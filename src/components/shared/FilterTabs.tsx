import { memo } from "react"
import { cn } from "@/lib/utils"

interface FilterTab {
  key: string
  label: string
  count?: number
}

interface FilterTabsProps {
  tabs: FilterTab[]
  activeKey: string
  onSelect: (key: string) => void
  className?: string
}

function FilterTabsComponent({ tabs, activeKey, onSelect, className }: FilterTabsProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1 scrollbar-none", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onSelect(tab.key)}
          className={cn(
            "px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors",
            activeKey === tab.key
              ? "bg-abyssal-primary text-white"
              : "bg-abyssal-surface-high text-abyssal-text-secondary hover:bg-abyssal-surface-high/80"
          )}
        >
          {tab.label} {tab.count !== undefined && `(${tab.count})`}
        </button>
      ))}
    </div>
  )
}

export const FilterTabs = memo(FilterTabsComponent)