"use client"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Plus, Users as UsersIcon, MagnifyingGlass } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { TopBar } from "@/components/layout/TopBar"
import { KpiCard } from "@/components/ui/kpi-card"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { ExportDropdown } from "@/components/shared/ExportDropdown"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import api from "@/lib/api"
import { FAB } from "@/components/shared/FAB"
import { statusColor } from "@/lib/status-colors"

interface Client {
  id: number
  name: string
  phone: string
  email: string
  company?: string
  status?: string
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
    } catch {
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const { total: totalClients, debtClients, activeClients, totalBalance } = useMemo(() => {
    let debtCount = 0, activeCount = 0, balance = 0
    for (const c of clients) {
      if (c.outstanding_balance > 0) debtCount++
      if (c.credit_limit > 0) activeCount++
      balance += c.outstanding_balance
    }
    return { total: clients.length, debtClients: debtCount, activeClients: activeCount, totalBalance: balance }
  }, [clients])

  const filtered = useMemo(() => {
    let result = clients
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.phone?.includes(q))
    }
    switch (filter) {
      case "Con Deuda": return result.filter((c) => c.outstanding_balance > 0)
      case "Al Corriente": return result.filter((c) => c.outstanding_balance <= 0)
      default: return result
    }
  }, [clients, search, filter])

  const filterTabs = [
    { key: "Todos", label: "Todos", count: clients.length },
    { key: "Con Deuda", label: "Con Deuda", count: debtClients },
    { key: "Al Corriente", label: "Al Corriente", count: clients.length - debtClients },
  ]

  async function handleAdd() {
    if (!name.trim()) return
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      addToast("Email inválido", "error")
      return
    }
    try {
      await api.post("/clients", { name: name.trim(), phone: phone.trim(), email: email.trim() })
      setName(""); setPhone(""); setEmail(""); setAddOpen(false)
      fetch()
    } catch {
      addToast("Error al agregar cliente", "error")
    }
  }

  return (
    <>
      <TopBar
        title="Clientes"
        icon={<UsersIcon size={18} />}
        subtitle="Gestión de clientes y relaciones"
        rightAction={
          <div className="flex items-center gap-1">
            <CollapsibleSearchBar value={search} onChange={setSearch} placeholder="Buscar cliente..." />
            <ExportDropdown
              data={clients}
              filename="clientes"
              headerMap={{ name: "Nombre", phone: "Teléfono", email: "Email" }}
              title="Reporte de Clientes"
              onExport={(f) => addToast(`Clientes exportados (${f})`, "success")}
            />
          </div>
        }
      />
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Clientes</h1>
            <p className="text-[14px] text-abyssal-text-secondary-variant font-body">Gestión de clientes y relaciones</p>
          </div>
          <Button variant="primary" size="sm" className="gap-1.5" onClick={() => router.push("/clients/new")}>
            <Plus size={16} />
            Nuevo Cliente
          </Button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Total Clientes</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{clients.length}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Leads Activos</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{activeClients}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Oportunidades</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{debtClients}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Tasa Conversión</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {clients.length > 0 ? ((activeClients / clients.length) * 100).toFixed(1) : "--"}%
            </p>
          </KpiCard>
        </div>

        {/* Funnel tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors ${
                filter === t.key ? "bg-abyssal-primary text-white" : "bg-abyssal-surface-high text-abyssal-text-secondary hover:bg-abyssal-surface-high/80"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-abyssal-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UsersIcon size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-[16px] text-abyssal-text-primary font-heading mb-2">No hay clientes</p>
            <p className="text-[14px] text-abyssal-text-secondary font-body mb-4">Agrega tu primer cliente para comenzar</p>
          </div>
        ) : (
          <div className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg shadow-abyssal-lg overflow-hidden">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Clientes Recientes</h3>
                <span className="text-[12px] text-abyssal-primary font-body font-medium">Ver todos</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-abyssal-outline">
                    <th className="text-left px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">NOMBRE</th>
                    <th className="text-left px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">EMPRESA</th>
                    <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">TELÉFONO</th>
                    <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 10).map((client, i) => {
                    const status = client.status || (client.outstanding_balance > 0 ? "Pendiente" : "Activo")
                    const colors = statusColor[status] || statusColor.Activo
                    return (
                      <tr key={client.id} className="border-b border-abyssal-outline hover:bg-abyssal-surface-high/50 transition-colors cursor-pointer" onClick={() => router.push(`/clients/${client.id}`)}>
                        <td className="px-6 py-4 text-[13px] text-abyssal-text-primary font-body">{client.name}</td>
                        <td className="px-6 py-4 text-[13px] text-abyssal-text-secondary font-body">{client.company || "—"}</td>
                        <td className="px-6 py-4 text-right text-[12px] text-abyssal-text-secondary-variant font-body">{client.phone || "—"}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-caption font-medium ${colors.bg} ${colors.text}`}>{status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <FAB onClick={() => router.push("/clients/new")} aria-label="Agregar cliente">
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