"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
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
          <div className="flex items-center justify-center h-32 text-body-medium text-abyssal-text-secondary">
            Cargando...
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-body-medium text-abyssal-text-secondary py-8">
            No se encontraron productos
          </p>
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
      <button
        onClick={() => router.push("/products/new")}
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:opacity-90 transition-opacity z-30"
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  )
}
