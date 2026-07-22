"use client"
import { usePathname } from "next/navigation"
import { AuthGuard } from "@/components/layout/AuthGuard"
import { BottomNav } from "@/components/layout/BottomNav"
import { Sidebar } from "@/components/layout/Sidebar"
import {
  LayoutDashboard, ShoppingCart, ClipboardList, Users,
  Truck, Package, Fish, DollarSign, ArrowLeftFromLine,
  ArrowRightFromLine, Settings
} from "lucide-react"

const pageMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  "/dashboard": { label: "Panel", icon: <LayoutDashboard size={18} /> },
  "/purchases": { label: "Compras", icon: <ShoppingCart size={18} /> },
  "/orders": { label: "Ventas", icon: <ClipboardList size={18} /> },
  "/clients": { label: "Clientes", icon: <Users size={18} /> },
  "/suppliers": { label: "Proveedores", icon: <Truck size={18} /> },
  "/inventory": { label: "Inventario", icon: <Package size={18} /> },
  "/products": { label: "Productos", icon: <Fish size={18} /> },
  "/cash-register": { label: "Caja", icon: <DollarSign size={18} /> },
  "/accounts-receivable": { label: "Cuentas por Cobrar", icon: <ArrowLeftFromLine size={18} /> },
  "/accounts-payable": { label: "Cuentas por Pagar", icon: <ArrowRightFromLine size={18} /> },
  "/settings": { label: "Configuración", icon: <Settings size={18} /> },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const basePath = "/" + pathname.split("/").filter(Boolean)[0]
  const meta = pageMeta[basePath]

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          {meta && (
            <div className="hidden lg:flex items-center gap-3 px-8 pt-6 pb-2">
              <div className="w-9 h-9 rounded-xl bg-abyssal-primary/10 flex items-center justify-center text-abyssal-primary">
                {meta.icon}
              </div>
              <h1 className="text-title-large text-abyssal-text-primary font-bold">{meta.label}</h1>
            </div>
          )}
          <div className="mx-auto lg:max-w-none lg:px-6 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav />
      </div>
    </AuthGuard>
  )
}
