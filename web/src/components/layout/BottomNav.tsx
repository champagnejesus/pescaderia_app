"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Fish, ClipboardList, Users, Truck, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Productos", icon: Fish },
  { href: "/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/suppliers", label: "Proveedores", icon: Truck },
  { href: "/cash-register", label: "Caja", icon: DollarSign },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-abyssal-surface border-t border-abyssal-outline z-40">
      <div className="max-w-[480px] mx-auto flex items-center justify-around h-16">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 text-label-small transition-colors",
                active ? "text-abyssal-primary" : "text-abyssal-text-secondary",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
