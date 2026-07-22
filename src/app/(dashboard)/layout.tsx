import { AuthGuard } from "@/components/layout/AuthGuard"
import { BottomNav } from "@/components/layout/BottomNav"
import { Sidebar } from "@/components/layout/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
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
