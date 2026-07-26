"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useCallback } from "react"
import {
  Layout, ShoppingCart, ClipboardText, Users,
  Truck, Package, Fish, CurrencyDollar, ChartBar,
  X, SignOut
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useLowStock } from "@/hooks/useLowStock"
import { ThemeToggle } from "./ThemeToggle"

const navItems = [
  { href: "/dashboard", label: "Panel", icon: Layout },
  { href: "/purchases", label: "Compras", icon: ShoppingCart },
  { href: "/orders", label: "Ventas", icon: ClipboardText },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/suppliers", label: "Proveedores", icon: Truck },
  { href: "/inventory", label: "Inventario", icon: Package },
  { href: "/products", label: "Productos", icon: Fish },
  { href: "/cash-register", label: "Caja", icon: CurrencyDollar },
  { href: "/finances", label: "Finanzas", icon: CurrencyDollar },
  { href: "/reports", label: "Reportes", icon: ChartBar },
  { href: "/settings", label: "Configuración", icon: ChartBar },
]

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname()
  const { count } = useLowStock()

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, handleEscape])

  return (
    <div className="md:hidden">
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 z-50 bg-abyssal-surface-high border-r border-abyssal-outline",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-abyssal-outline">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-abyssal-primary flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="text-sm text-abyssal-text-primary font-semibold font-heading">
              PESCAMAR
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-abyssal-text-secondary hover:bg-abyssal-surface-high transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-abyssal-primary/10 text-abyssal-primary"
                    : "text-abyssal-text-secondary hover:bg-abyssal-surface-high hover:text-abyssal-text-primary"
                )}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                <span>{label}</span>
                {href === "/products" && count > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-abyssal-outline">
          <div className="flex items-center justify-between px-3 py-2">
            <ThemeToggle />
            <button
              onClick={() => {
                const keys = ["abyssal-token", "abyssal-refresh-token", "abyssal-business-name", "abyssal-owner-name", "abyssal-user-email"]
                keys.forEach((k) => localStorage.removeItem(k))
                sessionStorage.clear()
                window.location.href = "/login"
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-abyssal-text-secondary hover:bg-abyssal-surface-highest hover:text-abyssal-red transition-all duration-200"
            >
              <SignOut className="w-[18px] h-[18px]" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
