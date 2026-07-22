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
      <p className="text-title-medium text-abyssal-text-primary mb-2">Cliente</p>
      <SearchBar value={searchValue} onChange={onSearch} placeholder="Buscar cliente..." className="mb-3" />
      <div className="flex gap-2 overflow-x-auto pb-2">
        {clients.map((client) => (
          <button
            key={client.id}
            onClick={() => onSelect(client)}
            className={cn(
              "flex flex-col items-center gap-1 shrink-0 p-2 rounded-abyssal-sm border-2 transition-colors",
              selectedId === client.id
                ? "border-abyssal-primary bg-abyssal-primary/5"
                : "border-transparent hover:border-abyssal-outline/20",
            )}
          >
            <div className="w-10 h-10 rounded-full bg-abyssal-primary-light flex items-center justify-center text-abyssal-primary text-label-small font-bold">
              {getInitials(client.name)}
            </div>
            <span className="text-label-small text-abyssal-text-primary text-center max-w-[72px] truncate">
              {client.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
