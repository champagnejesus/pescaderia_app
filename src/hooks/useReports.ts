'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface SalesReport {
  total_sales: number;
  total_expenses: number;
  net_profit: number;
  daily_breakdown: { date: string; sales: number; expenses: number }[];
}

interface ProductsReport {
  top_products: { product_id: string; product_name: string; quantity_sold: number; revenue: number }[];
}

interface ClientsReport {
  total_receivable: number;
  active_clients: number;
  top_clients: { client_id: string; client_name: string; total_purchases: number; order_count: number }[];
}

interface InventoryReport {
  total_value: number;
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  categories_summary: { category: string; value: number }[];
}

export function useReports(startDate?: string, endDate?: string) {
  const [salesData, setSalesData] = useState<SalesReport | null>(null);
  const [productsData, setProductsData] = useState<ProductsReport | null>(null);
  const [clientsData, setClientsData] = useState<ClientsReport | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const qs = params.toString();

      const [sales, products, clients, inventory] = await Promise.all([
        api.get(`/reports/sales?${qs}`),
        api.get(`/reports/products?${qs}`),
        api.get(`/reports/clients?${qs}`),
        api.get('/reports/inventory'),
      ]);

      setSalesData(sales.data);
      setProductsData(products.data);
      setClientsData(clients.data);
      setInventoryData(inventory.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { salesData, productsData, clientsData, inventoryData, loading, refetch: fetchAll };
}
