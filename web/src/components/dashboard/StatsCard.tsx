"use client"
import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { SparklineChart } from "./SparklineChart"

interface StatsCardProps {
  icon: ReactNode
  label: string
  value: string | number
  sparklineData?: { value: number }[]
}

export function StatsCard({ icon, label, value, sparklineData }: StatsCardProps) {
  return (
    <div className={cn("bg-abyssal-surface rounded-abyssal-md p-4 shadow-abyssal-sm flex items-center gap-4")}>
      <div className="w-10 h-10 rounded-full bg-abyssal-primary/10 flex items-center justify-center text-abyssal-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-label-medium text-abyssal-text-secondary truncate">{label}</p>
        <p className="text-title-large text-abyssal-text-primary font-semibold">{value}</p>
      </div>
      {sparklineData && (
        <div className="w-20 shrink-0">
          <SparklineChart data={sparklineData} />
        </div>
      )}
    </div>
  )
}
