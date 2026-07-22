"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ShoppingCart, ClipboardList, Users,
  Truck, Package, Fish, DollarSign, ArrowLeftFromLine,
  ArrowRightFromLine
} from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/purchases", label: "Compras", icon: ShoppingCart },
  { href: "/orders", label: "Ventas", icon: ClipboardList },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/suppliers", label: "Proveedores", icon: Truck },
  { href: "/inventory", label: "Inventario", icon: Package },
  { href: "/products", label: "Productos", icon: Fish },
  { href: "/cash-register", label: "Caja", icon: DollarSign },
  { href: "/accounts-receivable", label: "C x C", icon: ArrowLeftFromLine },
  { href: "/accounts-payable", label: "C x P", icon: ArrowRightFromLine },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navegación principal" className="fixed bottom-0 left-0 right-0 z-40">
      <div className="absolute inset-0 bg-abyssal-surface glass" />
      <div
        role="tablist"
        className="relative flex items-center gap-1 overflow-x-auto overflow-y-hidden h-[68px] px-2 pb-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              role="tab"
              aria-selected={active}
              aria-label={label}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 relative active:scale-90 snap-start shrink-0",
                active ? "text-abyssal-primary" : "text-abyssal-text-secondary",
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-300",
                active && "bg-abyssal-primary/12"
              )}>
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.2 : 1.8} />
              </div>
              <span className={cn(
                "text-[10px] leading-tight transition-all duration-200 whitespace-nowrap",
                active ? "font-semibold text-abyssal-primary" : "font-medium"
              )}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
