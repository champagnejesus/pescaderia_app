'use client';

import { useState, useMemo } from 'react';
import { Download, TrendUp, CurrencyDollar, Users, Package, Warning, CheckCircle} from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useReports } from '@/hooks/useReports';
import DateRangePicker from '@/components/common/DateRangePicker';
import api from '@/lib/api';
import { StatCard } from '@/components/shared/StatCard';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterTabs } from '@/components/shared/FilterTabs';
import { FAB } from '@/components/shared/FAB';
import { Card } from '@/components/ui/card';
import { TopBar } from '@/components/layout/TopBar';

const COLORS = ['#4A9FD8', '#30D158', '#FFD60A', '#FF453A', '#FF9F0A', '#BF5AF2'];

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
        <Warning size={48} className="text-abyssal-red mb-3" />
        <p className="text-body-medium text-abyssal-red">{error}</p>
      </div>
    );
  }

  return (
    <>
      <TopBar title="Reportes" icon={<Download size={18} />} subtitle="Análisis del rendimiento de tu negocio" />
      <div className="p-4 lg:p-0 space-y-4 lg:space-y-6">
        <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-headline-medium text-abyssal-text-primary font-heading font-bold">Reportes</h1>
            <p className="text-body-medium text-abyssal-text-secondary font-body mt-1">Análisis del rendimiento de tu negocio</p>
          </div>
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
          />
        </div>

        <div className="flex items-center justify-between border-b border-abyssal-outline pb-2">
          <FilterTabs
            tabs={tabs.map(t => ({ key: t.id, label: t.label }))}
            activeKey={activeTab}
            onSelect={setActiveTab}
          />
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-abyssal-primary/10 text-abyssal-primary rounded-abyssal-lg text-sm font-medium hover:bg-abyssal-primary/20 transition-colors border border-abyssal-primary/30 font-body"
          >
            <Download size={16} />
            Descargar PDF
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Ventas Totales</p>
            <p className="text-title-large text-abyssal-green font-heading font-bold mt-1">${stats.totalSales.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <TrendUp size={14} className="text-abyssal-green" />
              <span className="text-xs text-abyssal-text-secondary-variant font-caption">Ingresos brutos</span>
            </div>
          </KpiCard>
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Gastos Totales</p>
            <p className="text-title-large text-abyssal-red font-heading font-bold mt-1">${stats.totalExpenses.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <CurrencyDollar size={14} className="text-abyssal-red" />
              <span className="text-xs text-abyssal-text-secondary-variant font-caption">Egresos registrados</span>
            </div>
          </KpiCard>
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Utilidad Neta</p>
            <p className={`text-title-large font-heading font-bold mt-1 ${stats.netProfit >= 0 ? "text-abyssal-green" : "text-abyssal-red"}`}>${stats.netProfit.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <TrendUp size={14} className="text-abyssal-primary" />
              <span className="text-xs text-abyssal-text-secondary-variant font-caption">Ventas - Gastos</span>
            </div>
          </KpiCard>
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Ticket Promedio</p>
            <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">${Math.round(stats.avgTicket).toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <CheckCircle size={14} className="text-abyssal-primary" />
              <span className="text-xs text-abyssal-text-secondary-variant font-caption">Promedio diario</span>
            </div>
          </KpiCard>
        </div>

        {activeTab === 'resumen' && salesData && (
          <Card className="overflow-hidden rounded-abyssal-lg border border-abyssal-outline shadow-abyssal-lg">
            <div className="p-4 border-b border-abyssal-outline">
              <h3 className="text-title-medium text-abyssal-text-primary font-heading">Tendencia Diaria</h3>
            </div>
            <div className="p-4 h-[350px]">
              {salesData.daily_breakdown.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Package size={48} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
                  <p className="text-body-medium text-abyssal-text-secondary font-body">Sin transacciones en el período seleccionado</p>
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
          <Card className="overflow-hidden rounded-abyssal-lg border border-abyssal-outline shadow-abyssal-lg">
            <div className="p-4 border-b border-abyssal-outline">
              <h3 className="text-title-medium text-abyssal-text-primary font-heading">Productos Más Vendidos</h3>
            </div>
            <div className="p-4">
              {productsData.top_products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package size={48} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
                  <p className="text-body-medium text-abyssal-text-secondary font-body">Sin datos de productos en este período</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {productsData.top_products.slice(0, 10).map((p, index) => (
                    <div key={p.product_id} className="flex items-center justify-between p-3 bg-abyssal-surface-high/50 rounded-xl border border-abyssal-outline transition-colors hover:bg-abyssal-surface-high">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-8 h-8 rounded-lg bg-abyssal-primary/15 flex items-center justify-center text-abyssal-primary text-label-small font-bold shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-body-medium text-abyssal-text-primary font-medium truncate font-body">{p.product_name}</p>
                          <p className="text-label-small text-abyssal-text-secondary font-caption">{p.quantity_sold} unidades vendidas</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-body-large text-abyssal-green font-semibold font-heading">${p.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'clientes' && clientsData && (
          <Card className="overflow-hidden rounded-abyssal-lg border border-abyssal-outline shadow-abyssal-lg">
            <div className="p-4 border-b border-abyssal-outline">
              <h3 className="text-title-medium text-abyssal-text-primary font-heading">Clientes Top</h3>
            </div>
            <div className="p-4">
              {clientsData.top_clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users size={48} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
                  <p className="text-body-medium text-abyssal-text-secondary font-body">Sin datos de clientes en este período</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientsData.top_clients.slice(0, 10).map((c, index) => (
                    <div key={c.client_id} className="flex items-center justify-between p-3 bg-abyssal-surface-high/50 rounded-xl border border-abyssal-outline transition-colors hover:bg-abyssal-surface-high">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-8 h-8 rounded-lg bg-abyssal-primary/15 flex items-center justify-center text-abyssal-primary text-label-small font-bold shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-body-medium text-abyssal-text-primary font-medium truncate font-body">{c.client_name}</p>
                          <p className="text-label-small text-abyssal-text-secondary font-caption">{c.order_count} pedidos</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-body-large text-abyssal-primary font-semibold font-heading">${c.total_purchases.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'inventario' && inventoryData && (
          <Card className="overflow-hidden rounded-abyssal-lg border border-abyssal-outline shadow-abyssal-lg">
            <div className="p-4 border-b border-abyssal-outline">
              <h3 className="text-title-medium text-abyssal-text-primary font-heading">Resumen de Inventario</h3>
            </div>
            <div className="p-4">
              {inventoryData.categories_summary.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package size={48} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
                  <p className="text-body-medium text-abyssal-text-secondary font-body">Sin datos de inventario</p>
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

        <div className="flex gap-3">
          <div className="hidden lg:flex items-center gap-2 text-label-small text-abyssal-text-secondary font-caption">
            <span className="w-2 h-2 rounded-full bg-abyssal-green" />
            Ingresos
            <span className="w-2 h-2 rounded-full bg-abyssal-red ml-3" />
            Gastos
          </div>
        </div>
      </div>
    </>
  );
}