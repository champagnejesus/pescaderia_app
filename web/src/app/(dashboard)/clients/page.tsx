"use client"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Plus, Users } from "lucide-react"
import Link from "next/link"
import { TopBar } from "@/components/layout/TopBar"
import { SearchBar } from "@/components/shared/SearchBar"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientCard } from "@/components/clients/ClientCard"
import { ClientStats } from "@/components/clients/ClientStats"
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
  const [addOpen, setAddOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustBalance, setAdjustBalance] = useState("")
  const [adjusting, setAdjusting] = useState(false)

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
    if (!search) return clients
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search),
    )
  }, [clients, search])

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

  async function handleAdjustBalance() {
    if (!selectedClient) return
    const value = parseFloat(adjustBalance)
    if (isNaN(value)) return
    setAdjusting(true)
    try {
      await api.patch(`/clients/${selectedClient.id}/balance`, { new_balance: value })
      setClients((prev) =>
        prev.map((c) => (c.id === selectedClient.id ? { ...c, outstanding_balance: value } : c)),
      )
      setSelectedClient((prev) => (prev ? { ...prev, outstanding_balance: value } : null))
      setAdjustOpen(false)
      setAdjustBalance("")
    } catch (err) {
      console.error("Error adjusting balance:", err)
    } finally {
      setAdjusting(false)
    }
  }

  return (
    <>
      <TopBar title="Clientes" />
      <div className="p-4 space-y-3">
        <ClientStats
          totalClients={clients.length}
          totalBalance={clients.reduce((sum, c) => sum + c.outstanding_balance, 0)}
        />
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar cliente..." />
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary mb-2">No hay clientes</p>
            <p className="text-body-medium text-abyssal-text-secondary mb-4">Agrega tu primer cliente para comenzar</p>
            <Link href="/clients/new">
              <Button variant="primary">Agregar Cliente</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((client) => (
              <ClientCard key={client.id} client={client} onPress={handleCardPress} />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setAddOpen(true)}
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <h2 className="text-title-medium text-abyssal-text-primary mb-4">Agregar Cliente</h2>
        <div className="space-y-3">
          <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button className="w-full" onClick={handleAdd}>Guardar</Button>
        </div>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)}>
        {selectedClient && (
          <>
            <h2 className="text-title-medium text-abyssal-text-primary mb-4">
              {selectedClient.name}
            </h2>
            <div className="space-y-3 text-body-medium text-abyssal-text-secondary">
              <p><span className="text-abyssal-text-primary font-medium">Teléfono:</span> {selectedClient.phone}</p>
              <p><span className="text-abyssal-text-primary font-medium">Email:</span> {selectedClient.email}</p>
              <p>
                <span className="text-abyssal-text-primary font-medium">Saldo Pendiente:</span>{" "}
                <span className={selectedClient.outstanding_balance > 0 ? "text-abyssal-red" : "text-abyssal-green"}>
                  ${selectedClient.outstanding_balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
              </p>
              <p><span className="text-abyssal-text-primary font-medium">Límite de Crédito:</span> ${selectedClient.credit_limit.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
            </div>
            <Button className="w-full mt-4" onClick={() => { setAdjustBalance(String(selectedClient.outstanding_balance)); setAdjustOpen(true) }}>
              Ajustar Saldo
            </Button>
          </>
        )}
      </Dialog>

      <Dialog open={adjustOpen} onClose={() => setAdjustOpen(false)}>
        <h2 className="text-title-medium text-abyssal-text-primary mb-4">Ajustar Saldo</h2>
        <div className="space-y-3">
          <Input
            type="number"
            step="0.01"
            placeholder="Nuevo saldo"
            value={adjustBalance}
            onChange={(e) => setAdjustBalance(e.target.value)}
          />
          <Button className="w-full" onClick={handleAdjustBalance} disabled={adjusting}>
            {adjusting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </Dialog>
    </>
  )
}
