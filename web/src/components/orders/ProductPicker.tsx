"use client"
import { Plus, Minus } from "lucide-react"
import { SearchBar } from "@/components/shared/SearchBar"
import { cn } from "@/lib/utils"

interface Product {
  id: number
  name: string
  stock: number
  unit: string
  price: number
}

interface SelectedItem {
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
}

interface ProductPickerProps {
  products: Product[]
  selected: SelectedItem[]
  onAdd: (product: Product) => void
  onUpdateQty: (productId: number, qty: number) => void
  onSearch: (q: string) => void
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export function ProductPicker({ products, selected, onAdd, onUpdateQty, onSearch }: ProductPickerProps) {
  const selectedIds = new Set(selected.map((s) => s.product_id))

  return (
    <div>
      <p className="text-title-medium text-abyssal-text-primary mb-2">Productos</p>
      <SearchBar value="" onChange={onSearch} placeholder="Buscar producto..." className="mb-3" />

      <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
        {products
          .filter((p) => !selectedIds.has(p.id))
          .map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between bg-abyssal-surface-high rounded-abyssal-sm p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-body-medium text-abyssal-text-primary truncate">{product.name}</p>
                <p className="text-label-small text-abyssal-text-secondary">
                  Stock: {product.stock} {product.unit}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-body-medium text-abyssal-text-primary font-semibold">
                  {formatCurrency(product.price)}
                </span>
                <button
                  onClick={() => onAdd(product)}
                  className="w-8 h-8 rounded-full bg-abyssal-primary text-abyssal-on-primary flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        {products.length === 0 && (
          <p className="text-center text-body-medium text-abyssal-text-secondary py-4">
            No se encontraron productos
          </p>
        )}
      </div>

      {selected.length > 0 && (
        <div>
          <p className="text-body-medium text-abyssal-text-primary font-medium mb-2">Seleccionados</p>
          <div className="space-y-2">
            {selected.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center justify-between bg-abyssal-surface rounded-abyssal-sm p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body-medium text-abyssal-text-primary truncate">{item.product_name}</p>
                  <p className="text-label-small text-abyssal-text-secondary">
                    {formatCurrency(item.unit_price)} c/u
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-abyssal-surface-high text-abyssal-text-primary flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-body-medium text-abyssal-text-primary font-semibold min-w-[20px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-abyssal-surface-high text-abyssal-text-primary flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
