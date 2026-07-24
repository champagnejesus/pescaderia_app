"use client"

import { memo, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  onRowClick?: (item: T) => void
  emptyMessage?: string
  emptyIcon?: ReactNode
  className?: string
  striped?: boolean
  hoverable?: boolean
}

function DataTableComponent<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "Sin datos",
  emptyIcon,
  className,
  striped = true,
  hoverable = true,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        {emptyIcon && <div className="text-abyssal-text-secondary mb-3" style={{ strokeWidth: 1 }}>{emptyIcon}</div>}
        <p className="text-body-medium text-abyssal-text-secondary">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-left">
        <thead>
          <tr className={cn("text-label-small text-abyssal-text-secondary border-b border-abyssal-primary/20")}>
            {columns.map((col) => (
              <th key={col.key} className={cn("py-3 px-2 font-medium", col.headerClassName)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                striped && "border-b border-abyssal-primary/20",
                hoverable && onRowClick && "hover:bg-abyssal-surface-high/50 cursor-pointer transition-colors"
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("py-3 px-2", col.className)}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const DataTable = memo(DataTableComponent)