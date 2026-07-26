"use client"

import { useState, useRef, useEffect } from "react"
import { Download, FileSpreadsheet, FileText, FileDown } from "lucide-react"
import { exportCSV, exportExcel, exportPDF } from "@/lib/export"

interface ExportDropdownProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  filename: string
  headerMap: Record<string, string>
  title?: string
  onExport?: (format: string) => void
  className?: string
  iconOnly?: boolean
}

export function ExportDropdown({ data, filename, headerMap, title, onExport, className, iconOnly }: ExportDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (data.length === 0) return
    switch (format) {
      case "csv": exportCSV(data, filename, headerMap); break
      case "excel": exportExcel(data, filename, headerMap); break
      case "pdf": exportPDF(data, filename, headerMap, title); break
    }
    onExport?.(format)
    setOpen(false)
  }

  const options = [
    { key: "excel" as const, label: "Excel (.xlsx)", icon: <FileSpreadsheet size={15} className="text-emerald-400" /> },
    { key: "pdf" as const, label: "PDF (.pdf)", icon: <FileText size={15} className="text-red-400" /> },
    { key: "csv" as const, label: "CSV (.csv)", icon: <FileDown size={15} className="text-blue-400" /> },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={className || "p-2 rounded-lg hover:bg-abyssal-surface-high transition-colors active:scale-95"}
        title="Exportar datos"
      >
        {iconOnly !== false ? (
          <Download size={18} className="text-abyssal-text-secondary" />
        ) : (
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-abyssal-text-secondary">
            <Download size={15} /> Exportar
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-abyssal-surface border border-abyssal-outline rounded-xl shadow-abyssal-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleExport(opt.key)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-abyssal-text-primary font-body hover:bg-abyssal-surface-high transition-colors text-left"
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
