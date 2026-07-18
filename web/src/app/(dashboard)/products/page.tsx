"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Package } from "lucide-react"
import Link from "next/link"
import { TopBar } from "@/components/layout/TopBar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductSearchBar } from "@/components/products/ProductSearchBar"
import { CategoryFilter } from "@/components/products/CategoryFilter"
import { ProductCard } from "@/components/products/ProductCard"
import { useProducts } from "@/hooks/useProducts"

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

  return (
    <>
      <TopBar title="Productos" />
      <div className="p-4 space-y-3">
        <ProductSearchBar value={search} onChange={setSearch} />
        <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
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
            <Link href="/products/new">
              <Button variant="primary">Agregar Producto</Button>
            </Link>
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
      <Link
        href="/products/new"
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 z-30"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </>
  )
}
