"use client"
import { X } from "lucide-react"
import type { Toast } from "@/hooks/useToast"
import { cn } from "@/lib/utils"

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

const typeStyles: Record<string, string> = {
  success: "bg-abyssal-green-bg text-abyssal-green border-abyssal-green/20",
  error: "bg-abyssal-red-bg text-abyssal-red border-abyssal-red/20",
  info: "bg-abyssal-primary/10 text-abyssal-primary border-abyssal-primary/20",
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-32px)] max-w-[448px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-[15px] font-medium shadow-lg backdrop-blur-sm animate-fade-in",
            typeStyles[toast.type]
          )}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="shrink-0 p-0.5 rounded-full hover:opacity-70 transition-opacity"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
