'use client';

import { useState } from 'react';
import api from '@/lib/api';

export interface Adjustment {
  id: number;
  product_id: number;
  product_name: string;
  type: string;
  quantity_before: number;
  quantity_adjusted: number;
  quantity_after: number;
  reason: string;
  notes: string | null;
  created_at: string;
}

export function useInventoryAdjustments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adjustStock = async (productId: number, quantityChange: number, reason: string, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/inventory/adjust', {
        product_id: productId,
        quantity_change: quantityChange,
        reason,
        notes,
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al ajustar stock');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const physicalCount = async (productId: number, actualQuantity: number, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/inventory/physical-count', {
        product_id: productId,
        actual_quantity: actualQuantity,
        notes,
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrar conteo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAdjustments = async (productId?: number) => {
    const params = new URLSearchParams();
    if (productId) params.append('product_id', productId.toString());
    const response = await api.get(`/inventory/adjustments?${params.toString()}`);
    return response.data;
  };

  return { adjustStock, physicalCount, getAdjustments, loading, error };
}
