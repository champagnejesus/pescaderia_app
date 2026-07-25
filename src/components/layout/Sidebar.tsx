"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { memo } from "react"
import {
  LayoutDashboard, ShoppingCart, ClipboardList, Users,
  Truck, Package, Fish, ArrowLeftFromLine,
  ArrowRightFromLine, LogOut, type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import LowStockBadge from "./LowStockBadge"
import { ThemeToggle } from "./ThemeToggle"

const menuItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/purchases", label: "Compras", icon: ShoppingCart },
  { href: "/orders", label: "Ventas", icon: ClipboardList },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/suppliers", label: "Proveedores", icon: Truck },
  { href: "/inventory", label: "Inventario", icon: Package },
  { href: "/products", label: "Productos", icon: Fish },
  { href: "/accounts-receivable", label: "Cuentas por cobrar", icon: ArrowLeftFromLine },
  { href: "/accounts-payable", label: "Cuentas por pagar", icon: ArrowRightFromLine },
]

const SidebarItem = memo(function SidebarItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "contain-render flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        active
          ? "bg-abyssal-primary/10 text-abyssal-primary"
          : "text-abyssal-text-secondary hover:bg-abyssal-surface-high hover:text-abyssal-text-primary"
      )}
    >
      <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.2 : 1.8} />
      <span>{label}</span>
      {href === "/products" && <LowStockBadge />}
    </Link>
  )
})

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    const keysToRemove = [
      "abyssal-token",
      "abyssal-refresh-token",
      "abyssal-business-name",
      "abyssal-owner-name",
    ]
    keysToRemove.forEach((key) => localStorage.removeItem(key))
    sessionStorage.clear()
    window.location.href = "/login"
  }

  return (
    <aside
      className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-64 z-40 bg-abyssal-surface-high border-r border-abyssal-outline"
    >
      <div className="flex items-center gap-3 px-5 h-16 border-b border-abyssal-outline">
        <div className="w-8 h-8 rounded-lg bg-abyssal-primary flex items-center justify-center text-white font-bold text-xs">
          P
        </div>
        <span className="text-sm text-abyssal-text-primary font-semibold font-heading">
          PESCAMAR
        </span>
        <span className="text-[10px] text-abyssal-text-secondary-variant font-caption tracking-wider mt-1">ERP</span>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <SidebarItem
              key={href}
              href={href}
              label={label}
              icon={Icon}
              active={active}
            />
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-abyssal-outline">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-abyssal-primary/10 flex items-center justify-center text-abyssal-primary text-xs font-semibold">
            CA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-abyssal-text-primary font-medium truncate">Carlos Aguirre</p>
            <p className="text-[11px] text-abyssal-text-secondary-variant font-caption truncate">c.aguirre@pescamar.pe</p>
          </div>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-abyssal-text-secondary hover:bg-abyssal-surface-highest hover:text-abyssal-red transition-all duration-200 w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}