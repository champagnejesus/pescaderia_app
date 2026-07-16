"use client"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { SearchBar } from "@/components/shared/SearchBar"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SupplierCard } from "@/components/suppliers/SupplierCard"
import api from "@/lib/api"

interface Supplier {
  id: number
  name: string
  category: string
  pending_payment: number
  status: string
  image_url: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Supplier[]>("/suppliers", { params: { limit: 100 } })
      setSuppliers(data)
    } catch (err) {
      console.error("Error fetching suppliers:", err)
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = useMemo(() => {
    if (!search) return suppliers
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()),
    )
  }, [suppliers, search])

  async function handleAdd() {
    if (!name.trim()) return
    try {
      await api.post("/suppliers", { name: name.trim(), category: category.trim() })
      setName("")
      setCategory("")
      setAddOpen(false)
      fetch()
    } catch (err) {
      console.error("Error adding supplier:", err)
    }
  }

  return (
    <>
      <TopBar title="Proveedores" />
      <div className="p-4 space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar proveedor..." />
        {loading ? (
          <div className="flex items-center justify-center h-32 text-body-medium text-abyssal-text-secondary">
            Cargando...
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-body-medium text-abyssal-text-secondary py-8">
            No se encontraron proveedores
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} onPress={(id: number) => {
                const s = suppliers.find((sup) => sup.id === id)
                if (s) { setSelectedSupplier(s); setDetailOpen(true) }
              }} />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setAddOpen(true)}
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:opacity-90 transition-opacity z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <h2 className="text-title-medium text-abyssal-text-primary mb-4">Agregar Proveedor</h2>
        <div className="space-y-3">
          <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Button className="w-full" onClick={handleAdd}>Guardar</Button>
        </div>
      </Dialog>
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)}>
        {selectedSupplier && (
          <>
            <h2 className="text-title-medium text-abyssal-text-primary mb-4">
              {selectedSupplier.name}
            </h2>
            <div className="space-y-3 text-body-medium text-abyssal-text-secondary">
              <p><span className="text-abyssal-text-primary font-medium">Categoría:</span> {selectedSupplier.category}</p>
              <p><span className="text-abyssal-text-primary font-medium">Estado:</span> {selectedSupplier.status}</p>
              <p><span className="text-abyssal-text-primary font-medium">Pago Pendiente:</span>{" "}
                <span className="text-abyssal-red">
                  ${selectedSupplier.pending_payment.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>
          </>
        )}
      </Dialog>
    </>
  )
}
