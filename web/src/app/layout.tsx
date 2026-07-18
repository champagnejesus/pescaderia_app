import type { Metadata } from "next"
import { ThemeProvider } from "@/providers/ThemeProvider"
import "@/styles/globals.css"; import "@/styles/abyssal-theme.css"
export const metadata: Metadata = { title: "Abyssal ERP", description: "Sistema de Gestión Logística" }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es" className="dark"><body className="bg-site text-abyssal-text-primary font-sans antialiased"><div id="bg-overlay" /><a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-abyssal-primary focus:text-white focus:rounded-xl focus:outline-none focus:ring-2 focus:ring-abyssal-primary/50">Saltar al contenido principal</a><ThemeProvider><div id="main-content">{children}</div></ThemeProvider></body></html>
}
