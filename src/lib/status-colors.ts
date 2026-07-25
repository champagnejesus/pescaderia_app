export const statusColor: Record<string, { bg: string; text: string }> = {
  PENDIENTE: { bg: "bg-[rgba(234,179,8,0.1)]", text: "text-[#eab308]" },
  ENTREGADO: { bg: "bg-[rgba(34,197,94,0.1)]", text: "text-[#22c55e]" },
  COMPLETADO: { bg: "bg-[rgba(34,197,94,0.1)]", text: "text-[#22c55e]" },
  PROCESANDO: { bg: "bg-[rgba(74,159,216,0.1)]", text: "text-abyssal-primary" },
  PAGADO: { bg: "bg-[rgba(34,197,94,0.1)]", text: "text-[#22c55e]" },
  "PAGO PARCIAL": { bg: "bg-[rgba(74,159,216,0.1)]", text: "text-abyssal-primary" },
  ANULADO: { bg: "bg-[rgba(239,68,68,0.1)]", text: "text-[#ef4444]" },
  Activo: { bg: "bg-[rgba(34,197,94,0.1)]", text: "text-[#22c55e]" },
  Pendiente: { bg: "bg-[rgba(234,179,8,0.1)]", text: "text-[#eab308]" },
  Inactivo: { bg: "bg-[rgba(239,68,68,0.1)]", text: "text-[#ef4444]" },
  default: { bg: "bg-[rgba(74,159,216,0.1)]", text: "text-abyssal-primary" },
}

export function getStatusColors(status: string) {
  return statusColor[status] || statusColor.default
}