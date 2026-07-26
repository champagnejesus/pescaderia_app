"use client"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

const AuthGuard = dynamic(
  () => import("@/components/layout/AuthGuard").then((mod) => mod.AuthGuard),
  { ssr: false }
)
import { BottomNav } from "@/components/layout/BottomNav"
import { Sidebar } from "@/components/layout/Sidebar"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import {
  LayoutDashboard, ShoppingCart, ClipboardList, Users,
  Truck, Package, Fish, ArrowLeftFromLine,
  ArrowRightFromLine, DollarSign, BarChart3
} from "lucide-react"

const pageMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  "/dashboard": { label: "Panel", icon: <LayoutDashboard size={18} /> },
  "/purchases": { label: "Compras", icon: <ShoppingCart size={18} /> },
  "/orders": { label: "Ventas", icon: <ClipboardList size={18} /> },
  "/clients": { label: "Clientes", icon: <Users size={18} /> },
  "/suppliers": { label: "Proveedores", icon: <Truck size={18} /> },
  "/inventory": { label: "Inventario", icon: <Package size={18} /> },
  "/products": { label: "Productos", icon: <Fish size={18} /> },
  "/finances": { label: "Finanzas", icon: <DollarSign size={18} /> },
  "/reports": { label: "Reportes", icon: <BarChart3 size={18} /> },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const basePath = "/" + pathname.split("/").filter(Boolean)[0]
  const meta = pageMeta[basePath]

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-abyssal-bg">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          {meta && (
            <div className="hidden lg:flex items-center justify-between px-8 pt-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-abyssal-primary/10 flex items-center justify-center text-abyssal-primary">
                  {meta.icon}
                </div>
                <h1 className="text-title-large text-abyssal-text-primary font-heading font-bold">{meta.label}</h1>
              </div>
              <ThemeToggle />
            </div>
          )}
          <div className="mx-auto lg:max-w-[1280px] lg:px-8 pb-24 lg:pb-8">
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