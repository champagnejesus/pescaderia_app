"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Fish, ClipboardList, Users, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/products", label: "Productos", icon: Fish },
  { href: "/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/cash-register", label: "Caja", icon: DollarSign },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-abyssal-surface border-t border-abyssal-outline/50 z-40">
      <div className="max-w-[480px] mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-abyssal-sm transition-all duration-200 relative active:scale-95",
                active ? "text-abyssal-primary" : "text-abyssal-text-secondary hover:text-abyssal-text-primary",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
              {active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-abyssal-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
