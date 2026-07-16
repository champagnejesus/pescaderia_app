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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-abyssal-text-secondary" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-abyssal-surface-high rounded-abyssal-sm px-4 py-3 pl-10 w-full text-abyssal-text-primary outline-none border border-abyssal-outline focus:border-abyssal-primary placeholder:text-abyssal-text-secondary transition-colors"
      />
    </div>
  )
}
