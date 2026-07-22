"use client"
import { useState } from "react"
import api from "@/lib/api"
import { useRouter } from "next/navigation"

interface AuthState { loading: boolean; error: string }

export function useAuth() {
  const [state, setState] = useState<AuthState>({ loading: false, error: "" })
  const router = useRouter()

  const login = async (email: string, password: string) => {
    setState({ loading: true, error: "" })
    try {
      const { data } = await api.post("/auth/login", { email, password })
      localStorage.setItem("abyssal-token", data.access_token)
      localStorage.setItem("abyssal-business-name", data.business_name)
      localStorage.setItem("abyssal-owner-name", data.owner_name)
      router.push("/dashboard")
    } catch (err: any) {
      setState({ loading: false, error: err.response?.data?.detail || "Error al iniciar sesión" })
    }
  }

  const register = async (businessName: string, ownerName: string, email: string, password: string, phone?: string) => {
    setState({ loading: true, error: "" })
    try {
      const { data } = await api.post("/auth/register", { business_name: businessName, owner_name: ownerName, email, password, phone })
      localStorage.setItem("abyssal-token", data.access_token)
      localStorage.setItem("abyssal-business-name", data.business_name)
      localStorage.setItem("abyssal-owner-name", data.owner_name)
      router.push("/dashboard")
    } catch (err: any) {
      setState({ loading: false, error: err.response?.data?.detail || "Error al registrarse" })
    }
  }

  return { ...state, login, register }
}
