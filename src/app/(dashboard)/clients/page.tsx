"use client"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Download, Plus, Users, Users as UsersIcon } from "lucide-react"
import Link from "next/link"
import { TopBar } from "@/components/layout/TopBar"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { exportCSV } from "@/lib/export"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientCard } from "@/components/clients/ClientCard"
import { ClientStats } from "@/components/clients/ClientStats"
import { ClientFilters } from "@/components/clients/ClientFilters"
import api from "@/lib/api"
import { useRouter } from "next/navigation"

interface Client {
  id: number
  name: string
  initials: string
  phone: string
  email: string
  outstanding_balance: number
  credit_limit: number
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("Todos")
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const { toasts, addToast, removeToast } = useToast()

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Client[]>("/clients", { params: { limit: 100 } })
      setClients(data)
    } catch (err) {
      console.error("Error fetching clients:", err)
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = useMemo(() => {
    let result = clients
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
      )
    }
    switch (filter) {
      case "Con Deuda":
        return result.filter((c) => c.outstanding_balance > 0)
      case "Al Corriente":
        return result.filter((c) => c.outstanding_balance <= 0)
      case "Excede Límite":
        return result.filter((c) => c.credit_limit > 0 && c.outstanding_balance > c.credit_limit)
      default:
        return result
    }
  }, [clients, search, filter])

  const grouped = useMemo(() => {
    const debt = filtered.filter((c) => c.outstanding_balance > 0)
    const current = filtered.filter((c) => c.outstanding_balance <= 0)
    return { debt, current }
  }, [filtered])

  const debtClients = useMemo(() => clients.filter((c) => c.outstanding_balance > 0).length, [clients])
  const frequentClients = useMemo(() => debtClients, [debtClients])

  async function handleAdd() {
    if (!name.trim()) return
    try {
      await api.post("/clients", { name: name.trim(), phone: phone.trim(), email: email.trim() })
      setName("")
      setPhone("")
      setEmail("")
      setAddOpen(false)
      fetch()
    } catch (err) {
      console.error("Error adding client:", err)
    }
  }

  function handleCardPress(id: number) {
    router.push(`/clients/${id}`)
  }

  return (
    <>
      <TopBar
        title="Clientes"
        icon={<UsersIcon size={18} />}
        rightAction={
          <div className="flex items-center gap-1">
            <CollapsibleSearchBar value={search} onChange={setSearch} placeholder="Buscar cliente..." />
            <button
              onClick={() => {
                if (clients.length === 0) { addToast("No hay datos para exportar", "error"); return }
                exportCSV(clients, "clientes", {
                  name: "Nombre", phone: "Teléfono", email: "Email",
                })
                addToast("Clientes exportados", "success")
              }}
              className="p-2 rounded-full hover:bg-abyssal-surface-high transition-colors active:scale-95"
              aria-label="Exportar clientes"
            >
              <Download className="w-5 h-5 text-abyssal-text-secondary" />
            </button>
          </div>
        }
      />
      <div className="p-4 space-y-3">
        <ClientStats totalClients={clients.length} debtClients={debtClients} frequentClients={frequentClients} />
        <ClientFilters selected={filter} onSelect={setFilter} />
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary mb-2">
              {filter !== "Todos" ? "No hay clientes en este filtro" : "No hay clientes"}
            </p>
            <p className="text-body-medium text-abyssal-text-secondary mb-4">
              {filter !== "Todos" ? "Prueba con otro filtro" : "Agrega tu primer cliente para comenzar"}
            </p>
            {filter === "Todos" && (
              <Link href="/clients/new">
                <Button variant="primary">Agregar Cliente</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.debt.length > 0 && (
              <div>
                <p className="text-label-small text-abyssal-text-secondary uppercase tracking-wider mb-2 px-1">
                  Con Deuda ({grouped.debt.length})
                </p>
                <div className="space-y-2">
                  {grouped.debt.map((client) => (
                    <ClientCard key={client.id} client={client} onPress={handleCardPress} />
                  ))}
                </div>
              </div>
            )}
            {grouped.current.length > 0 && (
              <div>
                <p className="text-label-small text-abyssal-text-secondary uppercase tracking-wider mb-2 px-1">
                  Al Corriente ({grouped.current.length})
                </p>
                <div className="space-y-2">
                  {grouped.current.map((client) => (
                    <ClientCard key={client.id} client={client} onPress={handleCardPress} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setAddOpen(true)}
        aria-label="Agregar cliente"
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Agregar Cliente" showClose>
        <div className="space-y-3">
          <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button className="w-full" onClick={handleAdd}>Guardar</Button>
        </div>
      </Dialog>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
