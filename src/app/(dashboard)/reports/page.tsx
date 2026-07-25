"use client"
import { useState } from "react"
import { Download, BarChart3, Package, DollarSign, Users, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { KpiCard } from "@/components/ui/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useReports } from "@/hooks/useReports"
import api from "@/lib/api"
import { formatCurrency } from "@/lib/formatters"
import { statusColor } from "@/lib/status-colors"

const reportCards = [
  { icon: <BarChart3 size={22} />, title: "Ventas Mensuales", desc: "Análisis de ventas", endpoint: "sales", filename: "reporte_ventas.pdf" },
  { icon: <Package size={22} />, title: "Inventario", desc: "Control de stock", endpoint: "inventory", filename: "reporte_inventario.pdf" },
  { icon: <DollarSign size={22} />, title: "Financiero", desc: "Estados financieros", endpoint: "financial", filename: "reporte_financiero.pdf" },
  { icon: <Users size={22} />, title: "Clientes", desc: "CRM Analytics", endpoint: "clients", filename: "reporte_clientes.pdf" },
]

const recentReportsData = [
  { name: "Ventas Mensuales - Enero 2025", date: "20/01/25", status: "COMPLETADO" },
  { name: "Inventario - Stock General", date: "19/01/25", status: "COMPLETADO" },
  { name: "Análisis Financiero Q4 2024", date: "18/01/25", status: "PROCESANDO" },
  { name: "CRM - Leads Activos", date: "17/01/25", status: "COMPLETADO" },
  { name: "Órdenes - Resumen Semanal", date: "16/01/25", status: "PENDIENTE" },
]

async function downloadPdf(endpoint: string, filename: string) {
  const response = await api.get(`/reports/pdf/${endpoint}`, { responseType: "blob" })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const { loading } = useReports()
  const { toasts, addToast, removeToast } = useToast()

  return (
    <>
      <TopBar title="Reportes" icon={<FileText size={18} />} subtitle="Análisis y reportes del sistema" />
      <div className="p-4 lg:p-8 space-y-6">
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Reportes</h1>
            <p className="text-[14px] text-abyssal-text-secondary-variant font-body">Análisis y reportes del sistema</p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Reportes Generados</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">4</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Descargas</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">23</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Usuarios Activos</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">12</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Reportes Programados</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">1</p>
          </KpiCard>
        </div>

        {/* Report Card Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {reportCards.map((card) => (
            <div key={card.title} className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(74,159,216,0.1)] flex items-center justify-center text-abyssal-primary">
                  {card.icon}
                </div>
                <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">{card.title}</h3>
              </div>
              <p className="text-[13px] text-abyssal-text-secondary font-body">{card.desc}</p>
              <button
                onClick={async () => {
                  try {
                    await downloadPdf(card.endpoint, card.filename)
                    addToast(`${card.title} descargado`, "success")
                  } catch {
                    addToast("Error al descargar reporte", "error")
                  }
                }}
                className="h-8 bg-abyssal-primary text-white rounded-lg text-[12px] font-semibold px-4 flex items-center justify-center gap-1.5 hover:bg-abyssal-primary/90 transition-colors"
              >
                <Download size={14} />
                Generar Reporte
              </button>
            </div>
          ))}
        </div>

        {/* Reportes Recientes */}
        <div className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Reportes Recientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-abyssal-outline">
                  <th className="text-left px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">REPORTE</th>
                  <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">FECHA</th>
                  <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {recentReportsData.length > 0 ? recentReportsData.map((r, i) => {
                  const colors = statusColor[r.status] || statusColor.COMPLETADO
                  return (
                    <tr key={i} className="border-b border-abyssal-outline hover:bg-abyssal-surface-high/50 transition-colors">
                      <td className="px-6 py-4 text-[13px] text-abyssal-text-primary font-body">{r.name}</td>
                      <td className="px-6 py-4 text-right text-[12px] text-abyssal-text-secondary-variant font-caption">{r.date}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-caption font-medium ${colors.bg} ${colors.text}`}>{r.status}</span>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-[14px] text-abyssal-text-secondary font-body">Sin reportes recientes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}