import type { Metadata } from "next"
import { ThemeProvider } from "@/providers/ThemeProvider"
import "@/styles/globals.css"; import "@/styles/abyssal-theme.css"
export const metadata: Metadata = { title: "Abyssal ERP", description: "Sistema de Gestión Logística" }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es" className="dark"><body className="bg-abyssal-bg text-abyssal-text-primary font-sans antialiased"><ThemeProvider>{children}</ThemeProvider></body></html>
}
