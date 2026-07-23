'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useReports } from '@/hooks/useReports';
import DateRangePicker from '@/components/common/DateRangePicker';

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export default function ReportTabs() {
  const [activeTab, setActiveTab] = useState('resumen');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const { salesData, productsData, clientsData, inventoryData, loading } = useReports(dateRange.startDate, dateRange.endDate);

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'productos', label: 'Productos' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'inventario', label: 'Inventario' },
  ];

  if (loading) {
    return <div className="text-gray-400 text-center py-12">Cargando reportes...</div>;
  }

  return (
    <div className="space-y-6">
      <DateRangePicker
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
      />

      <div className="flex gap-2 border-b border-white/10 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resumen' && salesData && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm">Ingresos</p>
              <p className="text-2xl font-bold text-green-400">${salesData.total_sales.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm">Gastos</p>
              <p className="text-2xl font-bold text-red-400">${salesData.total_expenses.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm">Ganancia Neta</p>
              <p className={`text-2xl font-bold ${salesData.net_profit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                ${salesData.net_profit.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="h-80 bg-white/5 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Tendencia Diaria</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData.daily_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Bar dataKey="sales" fill="#10b981" name="Ingresos" />
                <Bar dataKey="expenses" fill="#ef4444" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'productos' && productsData && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Productos Más Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-left py-3">Producto</th>
                  <th className="text-right py-3">Unidades</th>
                  <th className="text-right py-3">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {productsData.top_products.map((p) => (
                  <tr key={p.product_id} className="border-b border-white/5">
                    <td className="py-3 text-white">{p.product_name}</td>
                    <td className="py-3 text-right text-gray-300">{p.quantity_sold}</td>
                    <td className="py-3 text-right text-cyan-400">${p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'clientes' && clientsData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm">Total por Cobrar</p>
              <p className="text-2xl font-bold text-yellow-400">${clientsData.total_receivable.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm">Clientes Activos</p>
              <p className="text-2xl font-bold text-cyan-400">{clientsData.active_clients}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white">Clientes Top</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-left py-3">Cliente</th>
                  <th className="text-right py-3">Compras</th>
                  <th className="text-right py-3">Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {clientsData.top_clients.map((c) => (
                  <tr key={c.client_id} className="border-b border-white/5">
                    <td className="py-3 text-white">{c.client_name}</td>
                    <td className="py-3 text-right text-cyan-400">${c.total_purchases.toFixed(2)}</td>
                    <td className="py-3 text-right text-gray-300">{c.order_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventario' && inventoryData && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm">Valor Total</p>
              <p className="text-2xl font-bold text-cyan-400">${inventoryData.total_value.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm">Productos</p>
              <p className="text-2xl font-bold text-white">{inventoryData.total_products}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm">Stock Bajo</p>
              <p className="text-2xl font-bold text-orange-400">{inventoryData.low_stock_count}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm">Sin Stock</p>
              <p className="text-2xl font-bold text-red-400">{inventoryData.out_of_stock_count}</p>
            </div>
          </div>

          <div className="h-80 bg-white/5 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Por Categoría</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData.categories_summary}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                >
                  {inventoryData.categories_summary.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
