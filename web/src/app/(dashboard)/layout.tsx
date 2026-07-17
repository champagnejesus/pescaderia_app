import { AuthGuard } from "@/components/layout/AuthGuard"
import { BottomNav } from "@/components/layout/BottomNav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-abyssal-bg">
        <main className="max-w-[480px] mx-auto pb-24">{children}</main>
        <BottomNav />
      </div>
    </AuthGuard>
  )
}
