"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, ShoppingCart, ClipboardList, Users,
  Truck, Package, Fish, DollarSign, ArrowLeftFromLine,
  ArrowRightFromLine, LogOut, Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/purchases", label: "Compras", icon: ShoppingCart },
  { href: "/orders", label: "Ventas", icon: ClipboardList },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/suppliers", label: "Proveedores", icon: Truck },
  { href: "/inventory", label: "Inventario", icon: Package },
  { href: "/products", label: "Productos", icon: Fish },
  { href: "/cash-register", label: "Caja", icon: DollarSign },
  { href: "/accounts-receivable", label: "Cuentas por cobrar", icon: ArrowLeftFromLine },
  { href: "/accounts-payable", label: "Cuentas por pagar", icon: ArrowRightFromLine },
  { href: "/settings", label: "Configuración", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("abyssal-token")
    router.push("/login")
  }

  return (
    <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-64 z-40 bg-abyssal-surface glass border-r border-abyssal-outline/30">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-abyssal-outline/20">
        <div className="w-7 h-7 rounded-lg bg-abyssal-primary flex items-center justify-center text-white font-bold text-xs">
          A
        </div>
        <span className="text-sm text-abyssal-text-primary font-semibold">
          Abyssal ERP
        </span>
      </div>

      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative",
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
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-2 border-t border-abyssal-outline/20">
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
