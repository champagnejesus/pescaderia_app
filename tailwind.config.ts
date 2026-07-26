import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--abyssal-font-heading)"],
        body: ["var(--abyssal-font-body)"],
        caption: ["var(--abyssal-font-caption)"],
        mono: ["var(--abyssal-font-mono)"],
      },
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
        "abyssal-sm": "4px",
        "abyssal-md": "8px",
        "abyssal-lg": "12px",
        "abyssal-xl": "16px",
        "abyssal-full": "9999px",
      },
      fontSize: {
        "display-large": ["34px", { lineHeight: "41px", fontWeight: "700", letterSpacing: "-0.41px" }],
        "headline-medium": ["24px", { lineHeight: "30px", fontWeight: "600", letterSpacing: "-0.3px" }],
        "title-large": ["20px", { lineHeight: "25px", fontWeight: "600", letterSpacing: "-0.3px" }],
        "title-medium": ["17px", { lineHeight: "22px", fontWeight: "600", letterSpacing: "-0.2px" }],
        "body-large": ["17px", { lineHeight: "22px", fontWeight: "400" }],
        "body-medium": ["15px", { lineHeight: "20px", fontWeight: "400" }],
        "label-medium": ["13px", { lineHeight: "18px", fontWeight: "500" }],
        "label-small": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "caption": ["11px", { lineHeight: "13px", fontWeight: "400" }],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "stagger-in": "staggerIn 0.3s ease-out forwards",
        "subtle-pulse": "subtlePulse 2s ease-in-out infinite",
        "spin": "spin 1s linear infinite",
      },
      boxShadow: {
        "abyssal-sm": "var(--abyssal-shadow-sm)",
        "abyssal-md": "var(--abyssal-shadow-md)",
        "abyssal-lg": "var(--abyssal-shadow-lg)",
        "abyssal-primary": "0 2px 8px rgba(74, 159, 216, 0.35)",
        "abyssal-primary-hover": "0 4px 16px rgba(74, 159, 216, 0.45)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}
export default config