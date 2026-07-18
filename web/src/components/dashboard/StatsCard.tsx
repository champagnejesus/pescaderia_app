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
    <div className={cn("bg-abyssal-surface glass rounded-2xl border border-abyssal-outline/20 p-4 flex items-center gap-3.5 transition-all duration-200")}>
      <div className="w-10 h-10 rounded-xl bg-abyssal-primary/12 flex items-center justify-center text-abyssal-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-abyssal-text-secondary truncate font-medium">{label}</p>
        <p className="text-[17px] text-abyssal-text-primary font-semibold mt-0.5">{value}</p>
      </div>
      {sparklineData && (
        <div className="w-20 shrink-0">
          <SparklineChart data={sparklineData} />
        </div>
      )}
    </div>
  )
}
