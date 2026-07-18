export function formatCurrency(n: number): string {
  return `$${(n ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0 && dateStr.includes("T")) return "Hoy"
    if (diffDays === 1) return "Ayer"
    if (diffDays < 7) return `Hace ${diffDays} días`
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-MX", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  } catch {
    return dateStr
  }
}
