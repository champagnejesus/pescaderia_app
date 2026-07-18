"use client"
import { useState } from "react"
import { Fish, Mail, Lock, Store, User, Phone } from "lucide-react"
import { FilterChip } from "@/components/shared/FilterChip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
    <div className="min-h-screen bg-abyssal-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-abyssal-primary/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col items-center gap-5 relative z-10">
        <div className="w-16 h-16 rounded-abyssal-xl bg-abyssal-primary/10 flex items-center justify-center animate-fade-in">
          <Fish size={36} className="text-abyssal-primary" />
        </div>

        <div className="text-center animate-fade-in" style={{ animationDelay: "50ms" }}>
          <h1 className="text-headline-medium text-abyssal-text-primary">Bienvenido</h1>
          <p className="text-body-medium text-abyssal-text-secondary mt-1">Inicia sesión o regístrate</p>
        </div>

        <div className="flex gap-1 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <FilterChip label="Iniciar sesión" selected={!isRegister} onClick={() => setIsRegister(false)} />
          <FilterChip label="Registrarse" selected={isRegister} onClick={() => setIsRegister(true)} />
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 animate-fade-in" style={{ animationDelay: "150ms" }}>
          {isRegister && (
            <>
              <div className="relative">
                <Store size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary pointer-events-none" />
                <Input
                  placeholder="Nombre del negocio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary pointer-events-none" />
                <Input
                  placeholder="Nombre del propietario"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary pointer-events-none" />
                <Input
                  placeholder="Teléfono (opcional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary pointer-events-none" />
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary pointer-events-none" />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          {error && (
            <div className="bg-abyssal-red-bg rounded-abyssal-sm px-4 py-2 text-body-medium text-abyssal-red text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            {loading ? "" : isRegister ? "Registrarse" : "Ingresar"}
          </Button>
        </form>

        <p className="text-label-small text-abyssal-text-secondary bg-abyssal-surface-high rounded-abyssal-full px-4 py-1.5">
          Abyssal ERP v1.0
        </p>
      </div>
    </div>
  )
}
