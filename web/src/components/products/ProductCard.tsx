"use client"
import { StockBadge } from "./StockBadge"

interface ProductCardProduct {
  id: number
  name: string
  category: string
  stock: number
  unit: string
  price: number
  image_url: string
  low_stock_threshold: number
  is_extra_quality: boolean
}

interface ProductCardProps {
  product: ProductCardProduct
  onPress: (id: number) => void
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const initial = product.name.charAt(0).toUpperCase()

  return (
    <button
      onClick={() => onPress(product.id)}
      className="flex items-center gap-3 p-3 bg-abyssal-surface rounded-abyssal-sm w-full text-left transition-colors hover:bg-abyssal-surface-high"
    >
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-abyssal-sm object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-abyssal-sm bg-abyssal-primary-light flex items-center justify-center text-abyssal-primary text-title-medium font-bold shrink-0">
          {initial}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-body-medium text-abyssal-text-primary font-medium truncate">{product.name}</p>
        <p className="text-label-small text-abyssal-text-secondary">{product.category}</p>
      </div>
      <div className="text-right flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1">
          <StockBadge stock={product.stock} threshold={product.low_stock_threshold} />
          <span className="text-label-small text-abyssal-text-secondary">{product.unit}</span>
        </div>
        <p className="text-body-medium text-abyssal-text-primary font-semibold">
          ${product.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </button>
  )
}
