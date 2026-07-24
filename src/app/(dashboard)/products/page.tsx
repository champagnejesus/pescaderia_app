"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Fish, Package, Filter } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { CategoryFilter } from "@/components/products/CategoryFilter"
import { ProductCard } from "@/components/products/ProductCard"
import { useProducts } from "@/hooks/useProducts"
import { FilterTabs } from "@/components/shared/FilterTabs"
import { StatCard } from "@/components/shared/StatCard"
import { FAB } from "@/components/shared/FAB"

export default function ProductsPage() {
  const { data: products, loading, categories } = useProducts()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("TODOS")
  const router = useRouter()

  const filtered = useMemo(() => {
    let result = products
    if (category !== "TODOS") result = result.filter((p) => p.category === category)
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    return result
  }, [products, category, search])

  const stats = useMemo(() => {
    const total = products.length
    const lowStock = products.filter((p) => p.stock <= p.low_stock_threshold).length
    const totalValue = products.reduce((sum, p) => sum + p.stock * p.price_compra, 0)
    return { total, lowStock, totalValue }
  }, [products])

  const filterTabs = [
    { key: "TODOS", label: "Todos", count: stats.total },
    { key: "BAJO", label: "Stock Bajo", count: stats.lowStock },
    { key: "NORMAL", label: "Disponibles", count: stats.total - stats.lowStock },
  ]

  return (
    <>
      <TopBar
        title="Productos"
        icon={<Fish size={18} />}
        rightAction={<CollapsibleSearchBar value={search} onChange={setSearch} placeholder="Buscar productos..." />}
      />
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <StatCard label="Productos" value={stats.total} icon={Package} />
          <StatCard label="Stock Bajo" value={stats.lowStock} icon={Filter} iconColor="abyssal-red" />
          <StatCard label="Valor Inventario" value={`$${stats.totalValue.toLocaleString("es-MX")}`} icon={Fish} iconColor="abyssal-green" />
        </div>

        <FilterTabs tabs={filterTabs} activeKey={category} onSelect={setCategory} />

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary mb-2">No se encontraron productos</p>
            <p className="text-body-medium text-abyssal-text-secondary mb-4">Agrega tu primer producto para comenzar</p>
            <Button variant="primary" onClick={() => router.push("/products/new")}>Agregar Producto</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={(id) => router.push(`/products/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
      <FAB href="/products/new" aria-label="Agregar producto">
        <Plus className="w-6 h-6" />
      </FAB>
    </>
  )
}