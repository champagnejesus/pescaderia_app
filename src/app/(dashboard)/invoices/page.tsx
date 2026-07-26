"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, FileText } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { ExportDropdown } from "@/components/shared/ExportDropdown"
import api from "@/lib/api"
import { statusColor } from "@/lib/status-colors"

interface Invoice { id: number; invoice_number: string; client_name: string; issue_date: string; total: number; status: string }

export default function InvoicesPage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => { api.get("/invoices").then(({ data }) => setInvoices(data)).catch(() => {}).finally(() => setLoading(false)) }, [])

  const filtered = useMemo(() => {
    if (!search) return invoices
    const q = search.toLowerCase()
    return invoices.filter((i) => i.invoice_number?.toLowerCase().includes(q) || i.client_name?.toLowerCase().includes(q))
  }, [invoices, search])

  return (
    <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Facturas</h1><p className="text-[14px] text-abyssal-text-secondary-variant">Gestión de facturación electrónica</p></div>
        <Button variant="primary" size="sm" className="gap-1.5" onClick={() => router.push("/invoices/new")}><PlusIcon size={16} /> Nueva Factura</Button>
      </div>
      <div className="flex items-center gap-2">
        <CollapsibleSearchBar value={search} onChange={setSearch} placeholder="Buscar factura..." />
        <ExportDropdown
          data={invoices}
          filename="facturas"
          headerMap={{ invoice_number: "Factura", client_name: "Cliente", total: "Total", status: "Estado" }}
          title="Reporte de Facturas"
          onExport={(f) => addToast(`Facturas exportadas (${f})`, "success")}
        />
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-abyssal-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center"><FileText size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} /><p className="text-[16px] text-abyssal-text-primary font-heading mb-2">No hay facturas</p><p className="text-[14px] text-abyssal-text-secondary">Crea tu primera factura para comenzar</p></div>
      ) : (
        <div className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg shadow-abyssal-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-abyssal-outline">
                <th className="text-left px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">FACTURA</th>
                <th className="text-left px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">CLIENTE</th>
                <th className="text-left px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">FECHA</th>
                <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">MONTO</th>
                <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ESTADO</th>
              </tr></thead>
              <tbody>
                {filtered.map((inv) => {
                  const colors = statusColor[inv.status] || statusColor["Pagada"]
                  return (
                    <tr key={inv.id} className="border-b border-abyssal-outline hover:bg-abyssal-surface-high/50 transition-colors cursor-pointer" onClick={() => router.push(`/orders/${inv.id}/invoice`)}>
                      <td className="px-6 py-4 text-[13px] text-abyssal-text-primary font-mono font-medium">{inv.invoice_number}</td>
                      <td className="px-6 py-4 text-[13px] text-abyssal-text-secondary">{inv.client_name}</td>
                      <td className="px-6 py-4 text-[12px] text-abyssal-text-secondary-variant">{new Date(inv.issue_date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="px-6 py-4 text-right text-[13px] text-abyssal-text-primary font-semibold">${inv.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-right"><span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-caption font-medium ${colors.bg} ${colors.text}`}>{inv.status}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
