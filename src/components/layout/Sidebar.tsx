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
        "contain-render flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative",
        active
          ? "bg-abyssal-primary/10 text-abyssal-primary"
          : "text-abyssal-text-secondary hover:bg-abyssal-surface-high hover:text-abyssal-text-primary"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-abyssal-primary" />
      )}
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
    localStorage.removeItem("abyssal-token")
    router.push("/login")
  }

  return (
    <aside
      className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-64 z-40 glass"
      style={{
        background: "rgba(30,30,34,0.72)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-7 h-7 rounded-lg bg-abyssal-primary flex items-center justify-center text-white font-bold text-xs">
          P
        </div>
        <span className="text-sm text-abyssal-text-primary font-semibold">
          PESCAMAR
        </span>
      </div>

      <nav className="flex-1 py-2 px-2 space-y-0.5">
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

      <div className="px-2 py-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[13px] font-medium text-abyssal-text-secondary hover:bg-abyssal-surface-high hover:text-abyssal-red transition-all duration-200 w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
