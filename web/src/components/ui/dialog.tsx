"use client"

import { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  showClose?: boolean
  title?: string
}

export function Dialog({ open, onClose, children, className, showClose, title }: DialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (open) document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn(
        "relative bg-abyssal-surface glass rounded-3xl border border-abyssal-outline/20 z-10 mx-4 w-full max-w-md shadow-lg animate-fade-in",
        className
      )}>
        {(title || showClose) && (
          <div className="flex items-center justify-between px-5 pt-5 pb-0">
            {title && <h2 className="text-[17px] font-semibold text-abyssal-text-primary">{title}</h2>}
            {showClose && (
              <button onClick={onClose} className="p-1.5 rounded-full bg-abyssal-surface-high/60 hover:bg-abyssal-surface-highest/60 transition-colors">
                <X className="w-4 h-4 text-abyssal-text-secondary" />
              </button>
            )}
          </div>
        )}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
