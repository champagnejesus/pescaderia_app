"use client"
import { useState } from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

const AuthGuard = dynamic(
  () => import("@/components/layout/AuthGuard").then((mod) => mod.AuthGuard),
  { ssr: false }
)
import { Sidebar } from "@/components/layout/Sidebar"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { TopBar } from "@/components/layout/TopBar"
import { MobileNav } from "@/components/layout/MobileNav"
import {
  Layout, ShoppingCart, ClipboardText, Users,
  Truck, Package, Fish, CurrencyDollar, ChartBar
} from "@phosphor-icons/react"

const pageMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  "/dashboard": { label: "Panel", icon: <Layout size={18} /> },
  "/purchases": { label: "Compras", icon: <ShoppingCart size={18} /> },
  "/orders": { label: "Ventas", icon: <ClipboardText size={18} /> },
  "/clients": { label: "Clientes", icon: <Users size={18} /> },
  "/suppliers": { label: "Proveedores", icon: <Truck size={18} /> },
  "/inventory": { label: "Inventario", icon: <Package size={18} /> },
  "/products": { label: "Productos", icon: <Fish size={18} /> },
  "/cash-register": { label: "Caja", icon: <CurrencyDollar size={18} /> },
  "/finances": { label: "Finanzas", icon: <CurrencyDollar size={18} /> },
  "/reports": { label: "Reportes", icon: <ChartBar size={18} /> },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const basePath = "/" + pathname.split("/").filter(Boolean)[0]
  const meta = pageMeta[basePath]
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-abyssal-bg w-full">
        <Sidebar />
        <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="flex-1 md:ml-64">
          <TopBar
            {...(meta ? { icon: meta.icon } : {})}
            title={meta?.label || ""}
            onMenuToggle={() => setMenuOpen(true)}
          />
          {meta && (
            <div className="hidden md:flex items-center justify-between px-8 pt-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-abyssal-primary/10 flex items-center justify-center text-abyssal-primary">
                  {meta.icon}
                </div>
                <h1 className="text-title-large text-abyssal-text-primary font-heading font-bold">{meta.label}</h1>
              </div>
              <ThemeToggle />
            </div>
          )}
          <div className="mx-auto md:max-w-[1280px] md:px-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
