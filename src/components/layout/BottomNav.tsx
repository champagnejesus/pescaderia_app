"use client"

import LinkIcon from "next/link"
import { usePathname } from "next/navigation"
import {
  ViewColumnsIcon, ShoppingCartIcon, ClipboardDocumentIcon, UsersIcon,
  TruckIcon, CubeIcon, CubeTransparentIcon, CurrencyDollarIcon, ArrowLeftIcon,
  ArrowRightIcon, Cog6ToothIcon, ChartBarIcon
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { useLowStock } from "@/hooks/useLowStock"

const tabs = [
  { href: "/dashboard", label: "Panel", icon: ViewColumnsIcon },
  { href: "/purchases", label: "Compras", icon: ShoppingCartIcon },
  { href: "/orders", label: "Ventas", icon: ClipboardDocumentIcon },
  { href: "/clients", label: "Clientes", icon: UsersIcon },
  { href: "/suppliers", label: "Proveedores", icon: TruckIcon },
  { href: "/inventory", label: "Inventario", icon: CubeIcon },
  { href: "/products", label: "Productos", icon: CubeTransparentIcon },
  { href: "/cash-register", label: "Caja", icon: CurrencyDollarIcon },
  { href: "/finances", label: "Finanzas", icon: CurrencyDollarIcon },
  { href: "/reports", label: "Reportes", icon: ChartBarIcon },
  { href: "/settings", label: "Config", icon: Cog6ToothIcon },
]

export function BottomNav() {
  const pathname = usePathname()
  const { count } = useLowStock()

  return (
    <nav aria-label="Navegación principal" className="fixed bottom-0 left-0 right-0 z-40">
      <div className="absolute inset-0 bg-abyssal-surface border-t border-abyssal-outline" />
      <div
        role="tablist"
        className="relative flex items-center gap-1 overflow-x-auto overflow-y-hidden h-[68px] px-2 pb-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <LinkIcon
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
                {href === "/products" && count > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {count}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] leading-tight transition-all duration-200 whitespace-nowrap",
                active ? "font-semibold text-abyssal-primary" : "font-medium"
              )}>{label}</span>
            </LinkIcon>
          )
        })}
      </div>
    </nav>
  )
}
