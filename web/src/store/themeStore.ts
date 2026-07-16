import { create } from "zustand"
type Theme = "dark" | "light"
interface ThemeStore { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }
export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "dark",
  toggle: () => set((s) => { const next = s.theme === "dark" ? "light" : "dark"; localStorage.setItem("abyssal-theme", next); return { theme: next } }),
  setTheme: (t) => { localStorage.setItem("abyssal-theme", t); set({ theme: t }) },
}))
