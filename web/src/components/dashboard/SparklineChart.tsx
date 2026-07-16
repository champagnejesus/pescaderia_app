"use client"
import { LineChart, Line, ResponsiveContainer } from "recharts"
interface Props { data: { value: number }[]; color?: string }
export function SparklineChart({ data, color = "#30D158" }: Props) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
