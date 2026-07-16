import { AuthGuard } from "@/components/layout/AuthGuard"
import { TopBar } from "@/components/layout/TopBar"
import { BottomNav } from "@/components/layout/BottomNav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-abyssal-bg">
        <TopBar title="Abyssal ERP" />
        <main className="max-w-[480px] mx-auto px-4 pt-4 pb-24">{children}</main>
        <BottomNav />
      </div>
    </AuthGuard>
  )
}
