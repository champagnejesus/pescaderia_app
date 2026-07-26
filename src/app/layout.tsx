import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/providers/ThemeProvider"
import "@/styles/globals.css"
import "@/styles/abyssal-theme.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = { title: "Abyssal ERP", description: "Sistema de Gestión Logística" }
export const viewport: Viewport = { width: "device-width", initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning style={{ overflowX: "hidden" }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('abyssal-theme');
                  if (theme === 'light') document.documentElement.classList.remove('dark');
                  else document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-abyssal-bg text-abyssal-text-primary font-body antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-abyssal-primary focus:text-white focus:rounded-xl focus:outline-none focus:ring-2 focus:ring-abyssal-primary/50"
        >
          Saltar al contenido principal
        </a>
        <ThemeProvider>
          <div id="main-content">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
