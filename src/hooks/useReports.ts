'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface SalesReport {
  total_sales: number;
  total_expenses: number;
  net_profit: number;
  daily_breakdown: { date: string; sales: number; expenses: number; net: number }[];
}

interface ProductsReport {
  top_products: { product_id: number; product_name: string; quantity_sold: number; revenue: number }[];
  slow_movers: { product_id: number; product_name: string; quantity_sold: number; revenue: number }[];
  total_products_sold: number;
}

interface ClientsReport {
  total_receivable: number;
  active_clients: number;
  top_clients: { client_id: number; client_name: string; total_purchases: number; order_count: number }[];
}

interface InventoryReport {
  total_value: number;
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  categories_summary: { category: string; count: number; value: number }[];
}

export function useReports(startDate?: string, endDate?: string) {
  const [salesData, setSalesData] = useState<SalesReport | null>(null);
  const [productsData, setProductsData] = useState<ProductsReport | null>(null);
  const [clientsData, setClientsData] = useState<ClientsReport | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const qs = params.toString();

      const results = await Promise.allSettled([
        api.get(`/reports/sales?${qs}`),
        api.get(`/reports/products?${qs}`),
        api.get(`/reports/clients?${qs}`),
        api.get('/reports/inventory'),
      ]);

      setSalesData(results[0].status === 'fulfilled' ? results[0].value.data : null);
      setProductsData(results[1].status === 'fulfilled' ? results[1].value.data : null);
      setClientsData(results[2].status === 'fulfilled' ? results[2].value.data : null);
      setInventoryData(results[3].status === 'fulfilled' ? results[3].value.data : null);

      if (results.every((r) => r.status === 'rejected')) {
        setError('Error al cargar reportes');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { salesData, productsData, clientsData, inventoryData, loading, error, refetch: fetchAll };
}
