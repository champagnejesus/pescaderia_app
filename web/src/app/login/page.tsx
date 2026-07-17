"use client"
import { useState } from "react"
import { Fish, Mail, Lock, Store, User, Phone } from "lucide-react"
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
      <div className="absolute inset-0 bg-gradient-to-br from-abyssal-primary/5 via-transparent to-abyssal-primary/10" />

      <div className="w-full max-w-sm flex flex-col items-center gap-4 relative z-10">
        <Fish size={64} className="text-abyssal-primary animate-fade-in" />

        <div className="text-center animate-fade-in">
          <h1 className="text-headline-medium text-abyssal-text-primary">Bienvenido</h1>
          <p className="text-body-medium text-abyssal-text-secondary">Inicia sesión o regístrate</p>
        </div>

        <div className="flex items-center gap-1 bg-abyssal-surface-high rounded-abyssal-full p-1 animate-fade-in">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`px-4 py-2 rounded-abyssal-full text-body-medium transition-all duration-200 ${
              !isRegister ? "bg-abyssal-primary text-abyssal-on-primary shadow-sm" : "text-abyssal-text-secondary hover:text-abyssal-text-primary"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`px-4 py-2 rounded-abyssal-full text-body-medium transition-all duration-200 ${
              isRegister ? "bg-abyssal-primary text-abyssal-on-primary shadow-sm" : "text-abyssal-text-secondary hover:text-abyssal-text-primary"
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 animate-fade-in">
          {isRegister && (
            <>
              <div className="relative">
                <Store size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
                <Input
                  placeholder="Nombre del negocio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
                <Input
                  placeholder="Nombre del propietario"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
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
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
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
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          {error && <p className="text-body-medium text-abyssal-red text-center">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full rounded-abyssal-sm"
          >
            {loading ? "" : isRegister ? "Registrarse" : "Ingresar"}
          </Button>
        </form>

        <p className="text-body-medium text-abyssal-text-secondary text-center mt-8 bg-abyssal-surface-high rounded-abyssal-full px-4 py-1.5">
          Abyssal ERP v1.0
        </p>
      </div>
    </div>
  )
}
