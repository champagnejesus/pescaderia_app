import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        abyssal: {
          bg: "var(--abyssal-bg)",
          surface: "var(--abyssal-surface)",
          "surface-high": "var(--abyssal-surface-high)",
          "surface-highest": "var(--abyssal-surface-highest)",
          outline: "var(--abyssal-outline)",
          "outline-variant": "var(--abyssal-outline-variant)",
          primary: "var(--abyssal-primary)",
          "primary-light": "var(--abyssal-primary-light)",
          "on-primary": "var(--abyssal-on-primary)",
          green: "var(--abyssal-green)",
          "green-bg": "var(--abyssal-green-bg)",
          yellow: "var(--abyssal-yellow)",
          "yellow-bg": "var(--abyssal-yellow-bg)",
          red: "var(--abyssal-red)",
          "red-bg": "var(--abyssal-red-bg)",
          "text-primary": "var(--abyssal-text-primary)",
          "text-secondary": "var(--abyssal-text-secondary)",
          "text-secondary-variant": "var(--abyssal-text-secondary-variant)",
        },
      },
      borderRadius: {
        "abyssal-sm": "12px",
        "abyssal-md": "16px",
        "abyssal-lg": "20px",
        "abyssal-xl": "24px",
        "abyssal-full": "9999px",
      },
      fontSize: {
        "display-large": ["34px", { lineHeight: "41px", fontWeight: "700", letterSpacing: "-0.5px" }],
        "headline-medium": ["24px", { lineHeight: "30px", fontWeight: "600", letterSpacing: "-0.2px" }],
        "title-large": ["20px", { lineHeight: "25px", fontWeight: "600" }],
        "title-medium": ["17px", { lineHeight: "22px", fontWeight: "600" }],
        "label-medium": ["13px", { lineHeight: "18px", fontWeight: "500" }],
        "body-large": ["15px", { lineHeight: "20px", fontWeight: "400" }],
        "body-medium": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "label-small": ["11px", { lineHeight: "13px", fontWeight: "700", letterSpacing: "0.5px" }],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "stagger-in": "staggerIn 0.3s ease-out forwards",
        "subtle-pulse": "subtlePulse 2s ease-in-out infinite",
        "spin": "spin 1s linear infinite",
      },
      boxShadow: {
        "abyssal-sm": "0 1px 3px rgba(0, 0, 0, 0.1)",
        "abyssal-md": "0 4px 6px rgba(0, 0, 0, 0.1)",
        "abyssal-lg": "0 10px 15px rgba(0, 0, 0, 0.1)",
        "abyssal-primary": "0 2px 8px rgba(94, 92, 230, 0.35)",
        "abyssal-primary-hover": "0 4px 16px rgba(94, 92, 230, 0.45)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}
export default config
