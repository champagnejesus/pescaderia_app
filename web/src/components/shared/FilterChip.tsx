import { cn } from "@/lib/utils"

interface FilterChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function FilterChip({ label, selected, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-abyssal-full px-3 py-1 text-body-medium transition-colors",
        selected
          ? "bg-abyssal-primary text-abyssal-on-primary"
          : "bg-abyssal-surface-high text-abyssal-text-secondary",
      )}
    >
      {label}
    </button>
  )
}
