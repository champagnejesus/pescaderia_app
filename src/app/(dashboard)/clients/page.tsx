"use client"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Download, Plus, Users, Users as UsersIcon, TrendingUp, ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { TopBar } from "@/components/layout/TopBar"
import { KpiCard } from "@/components/ui/kpi-card"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientCard } from "@/components/clients/ClientCard"
import { ClientFilters } from "@/components/clients/ClientFilters"
import api from "@/lib/api"
import { exportCSV } from "@/lib/export"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { FilterTabs } from "@/components/shared/FilterTabs"
import { FAB } from "@/components/shared/FAB"

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
  const activeClients = useMemo(() => clients.filter((c) => c.credit_limit > 0).length, [clients])
  const totalBalance = useMemo(() => clients.reduce((sum, c) => sum + c.outstanding_balance, 0), [clients])

  function generateInitials(fullName: string): string {
    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("")
  }

  async function handleAdd() {
    if (!name.trim()) return
    try {
      await api.post("/clients", { name: name.trim(), phone: phone.trim(), email: email.trim(), initials: generateInitials(name.trim()) })
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

  const filterTabs = [
    { key: "Todos", label: "Todos", count: clients.length },
    { key: "Con Deuda", label: "Con Deuda", count: debtClients },
    { key: "Al Corriente", label: "Al Corriente", count: clients.length - debtClients },
    { key: "Excede Límite", label: "Excede Límite", count: clients.filter((c) => c.credit_limit > 0 && c.outstanding_balance > c.credit_limit).length },
  ]

  return (
    <>
      <TopBar
        title="Clientes"
        icon={<UsersIcon size={18} />}
        subtitle="Gestión de clientes y relaciones"
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
      <div className="p-4 lg:p-0 space-y-4 lg:space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Total Clientes</p>
            <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">{clients.length}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <ArrowUpRight size={14} className="text-abyssal-primary" />
              <span className="text-xs font-semibold text-abyssal-primary font-caption">+18.3%</span>
              <span className="text-xs text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
            </div>
          </KpiCard>
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Leads Activos</p>
            <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">{activeClients}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <ArrowUpRight size={14} className="text-abyssal-primary" />
              <span className="text-xs font-semibold text-abyssal-primary font-caption">+24.5%</span>
              <span className="text-xs text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
            </div>
          </KpiCard>
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Con Deuda</p>
            <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">{debtClients}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp size={14} className="text-abyssal-yellow" />
              <span className="text-xs font-semibold text-abyssal-yellow font-caption">-5.2%</span>
              <span className="text-xs text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
            </div>
          </KpiCard>
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Saldo Pendiente</p>
            <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">
              S/ {totalBalance.toFixed(2)}
            </p>
          </KpiCard>
        </div>

        <ClientFilters selected={filter} onSelect={setFilter} />

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-abyssal-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary font-heading mb-2">
              {filter !== "Todos" ? "No hay clientes en este filtro" : "No hay clientes"}
            </p>
            <p className="text-body-medium text-abyssal-text-secondary font-body mb-4">
              {filter !== "Todos" ? "Prueba con otro filtro" : "Agrega tu primer cliente para comenzar"}
            </p>
            {filter === "Todos" && (
              <FAB onClick={() => setAddOpen(true)} aria-label="Agregar cliente">
                <Plus className="w-6 h-6" />
              </FAB>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.debt.length > 0 && (
              <div>
                <p className="text-label-small text-abyssal-text-secondary font-caption uppercase tracking-wider mb-2 px-1">
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
                <p className="text-label-small text-abyssal-text-secondary font-caption uppercase tracking-wider mb-2 px-1">
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

      <FAB onClick={() => setAddOpen(true)} aria-label="Agregar cliente">
        <Plus className="w-6 h-6" />
      </FAB>

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