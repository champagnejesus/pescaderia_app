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

  useEffect(() => {
    const token = localStorage.getItem("abyssal-token")
    if (!token) {
      router.replace("/login")
    } else {
      setAuthenticated(true)
    }
    setMounted(true)
  }, [router])

  if (!mounted || !authenticated) return null

  return <>{children}</>
}
