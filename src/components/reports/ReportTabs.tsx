'use client';

import { useState, useMemo } from 'react';
import { Download, TrendingUp, DollarSign, Users, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useReports } from '@/hooks/useReports';
import DateRangePicker from '@/components/common/DateRangePicker';
import api from '@/lib/api';
import { StatCard } from '@/components/shared/StatCard';
import { FilterTabs } from '@/components/shared/FilterTabs';
import { FAB } from '@/components/shared/FAB';
import { Card } from '@/components/ui/card';

const COLORS = ['#5E5CE6', '#30D158', '#FFD60A', '#FF453A', '#FF9F0A', '#BF5AF2'];

async function downloadPdf(endpoint: string, filename: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  const qs = params.toString();
  const url = `${api.defaults.baseURL}/reports/pdf/${endpoint}${qs ? `?${qs}` : ''}`;
  const token = localStorage.getItem('abyssal-token');
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Error downloading PDF');
  const blob = await response.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function ReportTabs() {
  const [activeTab, setActiveTab] = useState('resumen');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const { salesData, productsData, clientsData, inventoryData, loading, error } = useReports(dateRange.startDate, dateRange.endDate);

  const tabs = [
    { id: 'resumen', label: 'Resumen', pdf: 'sales', file: 'reporte_ventas.pdf' },
    { id: 'productos', label: 'Productos', pdf: 'products', file: 'reporte_productos.pdf' },
    { id: 'clientes', label: 'Clientes', pdf: 'clients', file: 'reporte_clientes.pdf' },
    { id: 'inventario', label: 'Inventario', pdf: 'inventory', file: 'reporte_inventario.pdf' },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab);

  const handleDownload = async () => {
    if (!currentTab) return;
    try {
      await downloadPdf(currentTab.pdf, currentTab.file, dateRange.startDate, dateRange.endDate);
    } catch (error) {
      console.error('PDF download error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-abyssal-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle size={48} className="text-abyssal-red mb-3" />
        <p className="text-body-medium text-abyssal-red">{error}</p>
      </div>
    );
  }

  const stats = useMemo(() => {
    if (!salesData) return { totalSales: 0, totalExpenses: 0, netProfit: 0, avgTicket: 0 };
    return {
      totalSales: salesData.total_sales || 0,
      totalExpenses: salesData.total_expenses || 0,
      netProfit: salesData.net_profit || 0,
      avgTicket: salesData.daily_breakdown?.length
        ? salesData.total_sales / salesData.daily_breakdown.length
        : 0,
    };
  }, [salesData]);

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-title-large lg:text-headline-medium text-abyssal-text-primary font-bold">Reportes</h1>
          <p className="text-body-medium text-abyssal-text-secondary mt-1">Análisis del rendimiento de tu negocio</p>
        </div>
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
        />
      </div>

      <div className="flex items-center justify-between border-b border-abyssal-primary/20 pb-2">
        <FilterTabs
          tabs={tabs.map(t => ({ key: t.id, label: t.label }))}
          activeKey={activeTab}
          onSelect={setActiveTab}
        />
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-abyssal-primary/10 text-abyssal-primary rounded-xl text-sm font-medium hover:bg-abyssal-primary/20 transition-colors border border-abyssal-primary/30"
        >
          <Download size={16} />
          Descargar PDF
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Ingresos" value={`$${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`} icon={TrendingUp} iconColor="abyssal-green" />
        <StatCard label="Gastos" value={`$${stats.totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`} icon={DollarSign} iconColor="abyssal-red" />
        <StatCard label="Ganancia Neta" value={`$${stats.netProfit.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`} icon={CheckCircle} iconColor={stats.netProfit >= 0 ? 'abyssal-green' : 'abyssal-red'} />
        <StatCard label="Ticket Promedio" value={`$${stats.avgTicket.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`} icon={DollarSign} iconColor="abyssal-primary" />
      </div>

      {activeTab === 'resumen' && salesData && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-abyssal-primary/20">
            <h3 className="text-title-medium text-abyssal-text-primary">Tendencia Diaria</h3>
          </div>
          <div className="p-4 h-[350px]">
            {salesData.daily_breakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Package size={48} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
                <p className="text-body-medium text-abyssal-text-secondary">Sin transacciones en el período seleccionado</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData.daily_breakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--abyssal-outline-variant)" />
                  <XAxis type="number" stroke="var(--abyssal-text-secondary-variant)" fontSize={12} tickFormatter={(v) => `$${v.toLocaleString('es-MX')}`} />
                  <YAxis dataKey="date" type="category" stroke="var(--abyssal-text-secondary-variant)" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--abyssal-surface)',
                      border: '1px solid var(--abyssal-outline)',
                      borderRadius: '12px',
                      boxShadow: 'var(--abyssal-shadow-lg)',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, '']}
                  />
                  <Bar dataKey="sales" fill="var(--abyssal-green)" name="Ingresos" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="expenses" fill="var(--abyssal-red)" name="Gastos" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'productos' && productsData && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-abyssal-primary/20">
            <h3 className="text-title-medium text-abyssal-text-primary">Productos Más Vendidos</h3>
          </div>
          <div className="p-4">
            {productsData.top_products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package size={48} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
                <p className="text-body-medium text-abyssal-text-secondary">Sin datos de productos en este período</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productsData.top_products.slice(0, 10).map((p, index) => (
                  <div key={p.product_id} className="flex items-center justify-between p-3 bg-abyssal-surface-high/50 rounded-xl border border-abyssal-primary/10 transition-colors hover:bg-abyssal-surface-high">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-8 h-8 rounded-lg bg-abyssal-primary/15 flex items-center justify-center text-abyssal-primary text-label-small font-bold shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-body-medium text-abyssal-text-primary font-medium truncate">{p.product_name}</p>
                        <p className="text-label-small text-abyssal-text-secondary">{p.quantity_sold} unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-body-large text-abyssal-green font-semibold">${p.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'clientes' && clientsData && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-abyssal-primary/20">
            <h3 className="text-title-medium text-abyssal-text-primary">Clientes Top</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard label="Por Cobrar" value={`$${clientsData.total_receivable.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`} icon={DollarSign} iconColor="abyssal-yellow" />
              <StatCard label="Activos" value={clientsData.active_clients} icon={Users} iconColor="abyssal-green" />
            </div>
            {clientsData.top_clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users size={48} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
                <p className="text-body-medium text-abyssal-text-secondary">Sin datos de clientes en este período</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientsData.top_clients.slice(0, 10).map((c, index) => (
                  <div key={c.client_id} className="flex items-center justify-between p-3 bg-abyssal-surface-high/50 rounded-xl border border-abyssal-primary/10 transition-colors hover:bg-abyssal-surface-high">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-8 h-8 rounded-lg bg-abyssal-primary/15 flex items-center justify-center text-abyssal-primary text-label-small font-bold shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-body-medium text-abyssal-text-primary font-medium truncate">{c.client_name}</p>
                        <p className="text-label-small text-abyssal-text-secondary">{c.order_count} pedidos</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-body-large text-abyssal-primary font-semibold">${c.total_purchases.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'inventario' && inventoryData && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-abyssal-primary/20">
            <h3 className="text-title-medium text-abyssal-text-primary">Resumen de Inventario</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <StatCard label="Valor Total" value={`$${inventoryData.total_value.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`} icon={DollarSign} iconColor="abyssal-primary" />
              <StatCard label="Productos" value={inventoryData.total_products} icon={Package} iconColor="abyssal-green" />
              <StatCard label="Stock Bajo" value={inventoryData.low_stock_count} icon={AlertTriangle} iconColor="abyssal-yellow" />
              <StatCard label="Sin Stock" value={inventoryData.out_of_stock_count} icon={AlertTriangle} iconColor="abyssal-red" />
            </div>
            {inventoryData.categories_summary.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package size={48} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
                <p className="text-body-medium text-abyssal-text-secondary">Sin datos de inventario</p>
              </div>
            ) : (
              <div className="h-[350px]">
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
                      labelLine={false}
                    >
                      {inventoryData.categories_summary.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--abyssal-surface)',
                        border: '1px solid var(--abyssal-outline)',
                        borderRadius: '12px',
                        boxShadow: 'var(--abyssal-shadow-lg)',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}