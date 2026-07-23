// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportCSV(data: any[], filename: string, headerMap: Record<string, string>) {
  if (data.length === 0) return

  const keys = Object.keys(headerMap)
  const headers = keys.map((k) => headerMap[k]).join(",")
  const rows = data.map((row) =>
    keys.map((k) => {
      const val = (row as Record<string, unknown>)[k]
      if (val === null || val === undefined) return ""
      const str = String(val)
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }).join(",")
  )

  const csv = [headers, ...rows].join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
