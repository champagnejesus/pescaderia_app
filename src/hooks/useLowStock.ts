'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  low_stock_threshold: number;
  unit: string;
}

export function useLowStock() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLowStock = useCallback(async () => {
    try {
      const response = await api.get('/products/low-stock');
      setProducts(response.data.products || response.data);
      setCount(response.data.count || (response.data.products || response.data).length);
    } catch (error) {
      console.error('Error fetching low stock:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLowStock();

    // Poll every 60 seconds
    const interval = setInterval(fetchLowStock, 60000);

    // Refetch on window focus
    const handleFocus = () => fetchLowStock();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchLowStock]);

  return { products, count, loading, refetch: fetchLowStock };
}
