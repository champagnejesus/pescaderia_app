"use client"
import { useState } from "react"
import { Fish, Mail, Lock, Store, User, Phone, Eye, EyeOff } from "lucide-react"
import { FilterChip } from "@/components/shared/FilterChip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [phone, setPhone] = useState("")
  const { loading, error, login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isRegister) {
      await register(businessName, ownerName, email, password, phone || undefined)
    } else {
      await login(email, password)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-sm flex flex-col items-center gap-5 relative z-10">
        <div className="w-16 h-16 rounded-[20px] bg-abyssal-primary/15 flex items-center justify-center animate-fade-in">
          <Fish size={32} className="text-abyssal-primary" />
        </div>

        <div className="text-center animate-fade-in" style={{ animationDelay: "50ms" }}>
          <h1 className="text-[24px] font-semibold text-abyssal-text-primary tracking-[-0.2px]">Bienvenido</h1>
          <p className="text-[15px] text-abyssal-text-secondary mt-1">Inicia sesión o regístrate</p>
        </div>

        <div className="flex gap-1.5 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <FilterChip label="Iniciar sesión" selected={!isRegister} onClick={() => setIsRegister(false)} />
          <FilterChip label="Registrarse" selected={isRegister} onClick={() => setIsRegister(true)} />
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 animate-fade-in" style={{ animationDelay: "150ms" }}>
          {isRegister && (
            <>
              <div className="relative">
                <Store size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-abyssal-text-secondary pointer-events-none" />
                <Input
                  placeholder="Nombre del negocio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-abyssal-text-secondary pointer-events-none" />
                <Input
                  placeholder="Nombre del propietario"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-abyssal-text-secondary pointer-events-none" />
                <Input
                  placeholder="Teléfono (opcional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-11"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-abyssal-text-secondary pointer-events-none" />
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11"
              required
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-abyssal-text-secondary pointer-events-none" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-abyssal-text-secondary hover:text-abyssal-text-primary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="bg-abyssal-red-bg rounded-xl px-4 py-2.5 text-[13px] text-abyssal-red text-center font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-1"
          >
            {loading ? "" : isRegister ? "Registrarse" : "Ingresar"}
          </Button>
        </form>

        <p className="text-[11px] font-semibold tracking-wide uppercase text-abyssal-text-secondary bg-abyssal-surface-high/50 glass-subtle rounded-full px-4 py-1.5">
          Abyssal ERP v1.0
        </p>
      </div>
    </div>
  )
}
