"use client"

import { useState, useRef, useEffect } from "react"
import { DownloadSimple, FileXls, FilePdf, FileCsv } from "@phosphor-icons/react"
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

const options = [
  { key: "excel" as const, label: "Excel", icon: <FileXls size={16} className="text-emerald-400" />, desc: ".xlsx" },
  { key: "pdf" as const, label: "PDF", icon: <FilePdf size={16} className="text-red-400" />, desc: ".pdf" },
  { key: "csv" as const, label: "CSV", icon: <FileCsv size={16} className="text-blue-400" />, desc: ".csv" },
]

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

  return (
    <div ref={ref} className="relative">
      {iconOnly === false ? (
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium text-abyssal-text-secondary hover:bg-abyssal-surface-high border border-abyssal-outline transition-all active:scale-[0.97] ${className || ""}`}
        >
          <DownloadSimple size={15} />
          Exportar
        </button>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-abyssal-text-secondary hover:bg-abyssal-surface-high border border-abyssal-outline transition-all active:scale-[0.93] ${className || ""}`}
          title="Exportar datos"
        >
          <DownloadSimple size={16} />
        </button>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-[170px] bg-abyssal-surface border border-abyssal-outline rounded-xl shadow-abyssal-lg overflow-hidden animate-fade-in">
          <div className="py-1">
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleExport(opt.key)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] text-abyssal-text-primary font-body hover:bg-abyssal-surface-high transition-colors text-left active:bg-abyssal-surface-high"
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-abyssal-surface-high shrink-0">
                  {opt.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-[10px] text-abyssal-text-secondary-variant font-caption">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
