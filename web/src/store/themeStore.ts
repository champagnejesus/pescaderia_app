import { create } from "zustand"

type Theme = "dark" | "light"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  const saved = localStorage.getItem("abyssal-theme") as Theme | null
  return saved || "dark"
}

interface ThemeStore {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  toggle: () => set((s) => {
    const next = s.theme === "dark" ? "light" : "dark"
    localStorage.setItem("abyssal-theme", next)
    return { theme: next }
  }),
  setTheme: (t) => {
    localStorage.setItem("abyssal-theme", t)
    set({ theme: t })
  },
}))
