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

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Supplier[]>("/suppliers", { params: { limit: 100 } })
      setSuppliers(data)
    } catch {
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
    } catch {
      // silently fail
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
              <SupplierCard key={supplier.id} supplier={supplier} onPress={() => {}} />
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
    </>
  )
}
