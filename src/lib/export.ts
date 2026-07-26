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
  download(blob, `${filename}.csv`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportExcel(data: any[], filename: string, headerMap: Record<string, string>) {
  if (data.length === 0) return
  import("xlsx").then((XLSX) => {
    const keys = Object.keys(headerMap)
    const rows = data.map((row) => {
      const obj: Record<string, unknown> = {}
      keys.forEach((k) => { obj[headerMap[k]] = (row as Record<string, unknown>)[k] ?? "" })
      return obj
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Datos")
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    download(blob, `${filename}.xlsx`)
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportPDF(data: any[], filename: string, headerMap: Record<string, string>, title?: string) {
  if (data.length === 0) return
  Promise.all([import("jspdf"), import("jspdf-autotable")]).then(([{ jsPDF }]) => {
    const doc = new jsPDF({ orientation: "landscape" })
    const keys = Object.keys(headerMap)
    const headers = keys.map((k) => headerMap[k])
    const body = data.map((row) =>
      keys.map((k) => {
        const val = (row as Record<string, unknown>)[k]
        return val === null || val === undefined ? "" : String(val)
      })
    )

    if (title) {
      doc.setFontSize(16)
      doc.setTextColor(30, 30, 30)
      doc.text(title, 14, 18)
      doc.setFontSize(9)
      doc.setTextColor(120, 120, 120)
      doc.text(`Exportado: ${new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })}`, 14, 25)
    }

    ;(doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable({
      head: [headers],
      body,
      startY: title ? 30 : 14,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [74, 159, 216], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    })

    doc.save(`${filename}.pdf`)
  })
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
