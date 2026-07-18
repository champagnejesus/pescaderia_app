import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = "Buscar...", className }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-abyssal-text-secondary" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-abyssal-surface-high/60 glass-subtle rounded-xl px-4 py-3 pl-11 w-full text-[15px] text-abyssal-text-primary outline-none border border-abyssal-outline/40 focus:border-abyssal-primary/60 focus:ring-4 focus:ring-abyssal-primary/10 placeholder:text-abyssal-text-secondary transition-all duration-200"
      />
    </div>
  )
}
