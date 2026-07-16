"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"

export interface Product {
  id: number
  name: string
  category: string
  stock: number
  unit: string
  price: number
  image_url: string
  description: string
  is_extra_quality: boolean
  low_stock_threshold: number
}

export function useProducts() {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [lowStockCount, setLowStockCount] = useState(0)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data: products } = await api.get<Product[]>("/products")
      setData(products)
      setCategories([...new Set(products.map((p) => p.category))])
      setLowStockCount(products.filter((p) => p.stock <= p.low_stock_threshold).length)
    } catch {
      setError("Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, categories, lowStockCount, refetch: fetch }
}
