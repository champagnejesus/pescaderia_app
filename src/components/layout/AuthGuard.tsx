"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  // Synchronous check on first render (before effects)
  if (typeof window !== "undefined" && !mounted) {
    const token = localStorage.getItem("abyssal-token")
    if (token) setAuthenticated(true)
    setMounted(true)
  }

  useEffect(() => {
    if (!mounted) return
    if (!authenticated) {
      router.replace("/login")
    }
  }, [mounted, authenticated, router])

  if (!mounted) return null
  if (!authenticated) return null

  return <>{children}</>
}