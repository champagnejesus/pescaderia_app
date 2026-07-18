"use client"
import { SearchBar } from "@/components/shared/SearchBar"
import { cn } from "@/lib/utils"

interface Client {
  id: number
  name: string
}

interface ClientSelectorProps {
  clients: Client[]
  selectedId: number | null
  onSelect: (client: Client) => void
  onSearch: (q: string) => void
  searchValue: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("")
}

export function ClientSelector({ clients, selectedId, onSelect, onSearch, searchValue }: ClientSelectorProps) {
  return (
    <div>
      <p className="text-[17px] font-semibold text-abyssal-text-primary mb-2">Cliente</p>
      <SearchBar value={searchValue} onChange={onSearch} placeholder="Buscar cliente..." className="mb-3" />
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {clients.map((client) => (
          <button
            key={client.id}
            onClick={() => onSelect(client)}
            className={cn(
              "flex flex-col items-center gap-1 shrink-0 p-2 rounded-2xl transition-all duration-200 active:scale-95",
              selectedId === client.id
                ? "bg-abyssal-primary/12"
                : "hover:bg-abyssal-surface-high/60",
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold",
              selectedId === client.id
                ? "bg-abyssal-primary text-white"
                : "bg-abyssal-primary/15 text-abyssal-primary"
            )}>
              {getInitials(client.name)}
            </div>
            <span className="text-[11px] text-abyssal-text-primary text-center max-w-[72px] truncate font-medium">
              {client.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
