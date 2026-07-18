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
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="absolute inset-0 bg-abyssal-surface glass border-t border-abyssal-outline/40" />
      <div className="relative max-w-[480px] mx-auto flex items-center justify-around h-[68px] px-2 pb-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 relative active:scale-90",
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
                "text-[10px] leading-tight transition-all duration-200",
                active ? "font-semibold text-abyssal-primary" : "font-medium"
              )}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
