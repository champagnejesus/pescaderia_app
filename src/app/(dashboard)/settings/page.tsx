"use client"

import { useState, useEffect, useCallback } from "react"
import { Settings, Save, Plus, X, ChevronUp, ChevronDown, Download, Trash2, Key, FileText, Briefcase, Package, Ruler, CreditCard, Percent, Info, TrendingUp, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { KpiCard } from "@/components/ui/kpi-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { TopBar } from "@/components/layout/TopBar"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import api from "@/lib/api"
import type { BusinessProfile, Category, Unit, PaymentMethod, TaxConfig, InvoicePrefs } from "@/lib/types"

interface Collaborator {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
}

type SettingsData = {
  profile: BusinessProfile | null
  categories: Category[]
  units: Unit[]
  paymentMethods: PaymentMethod[]
  taxConfig: TaxConfig | null
  invoicePrefs: InvoicePrefs | null
  collaborators: Collaborator[]
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-4 space-y-3 border border-abyssal-outline rounded-abyssal-lg shadow-abyssal-lg bg-abyssal-surface">
      <div className="flex items-center gap-2 text-[16px] text-abyssal-text-primary font-heading font-semibold">
        <span className="text-abyssal-primary">{icon}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </Card>
  )
}

export default function SettingsPage() {
  const { toasts, addToast, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SettingsData>({ profile: null, categories: [], units: [], paymentMethods: [], taxConfig: null, invoicePrefs: null, collaborators: [] })
  const [saving, setSaving] = useState<string | null>(null)

  const [profileForm, setProfileForm] = useState({ business_name: "", owner_name: "", phone: "", address: "" })
  const [pinForm, setPinForm] = useState({ pin: "", confirm_pin: "", require_pin: false })
  const [showPinForm, setShowPinForm] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [newUnitName, setNewUnitName] = useState("")
  const [newUnitAbbr, setNewUnitAbbr] = useState("")
  const [taxForm, setTaxForm] = useState({ is_enabled: false, name: "IVA", rate: 0, included_in_price: true })
  const [invoiceForm, setInvoiceForm] = useState({ footer_text: "", show_tax_breakdown: true, default_payment_method_id: null as number | null })
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearConfirmText, setClearConfirmText] = useState("")
  
  const [showAddUser, setShowAddUser] = useState(false)
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "Usuario" })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [profileRes, catsRes, unitsRes, pmRes, taxRes, invRes, collabsRes] = await Promise.all([
        api.get("/business/profile").catch(() => ({ data: null })),
        api.get("/categories").catch(() => ({ data: [] })),
        api.get("/units").catch(() => ({ data: [] })),
        api.get("/payment-methods").catch(() => ({ data: [] })),
        api.get("/tax-config").catch(() => ({ data: null })),
        api.get("/invoice-prefs").catch(() => ({ data: null })),
        api.get("/business/collaborators").catch(() => ({ data: [] })),
      ])
      const profile = profileRes.data
      setData({ profile, categories: catsRes.data, units: unitsRes.data, paymentMethods: pmRes.data, taxConfig: taxRes.data, invoicePrefs: invRes.data, collaborators: collabsRes.data })
      if (profile) {
        setProfileForm({ business_name: profile.business_name, owner_name: profile.owner_name, phone: profile.phone || "", address: profile.address || "" })
        setPinForm(prev => ({ ...prev, require_pin: profile.require_pin }))
      }
      if (taxRes.data) setTaxForm({ is_enabled: taxRes.data.is_enabled, name: taxRes.data.name, rate: taxRes.data.rate, included_in_price: taxRes.data.included_in_price })
      if (invRes.data) setInvoiceForm({ footer_text: invRes.data.footer_text, show_tax_breakdown: invRes.data.show_tax_breakdown, default_payment_method_id: invRes.data.default_payment_method_id })
    } catch (e) { addToast("Error al cargar configuración", "error"); console.error("Failed to load settings", e) }
    finally { setLoading(false) }
  }, [addToast])

  useEffect(() => { fetchAll() }, [fetchAll])

  const saveProfile = async () => {
    setSaving("profile")
    try { await api.put("/business/profile", profileForm); addToast("Perfil actualizado", "success"); fetchAll() }
    catch { addToast("Error al guardar perfil", "error") }
    finally { setSaving(null) }
  }

  const savePin = async () => {
    if (pinForm.pin !== pinForm.confirm_pin) { addToast("Los PIN no coinciden", "error"); return }
    if (pinForm.pin && (pinForm.pin.length !== 4 || !/^\d{4}$/.test(pinForm.pin))) { addToast("El PIN debe tener 4 dígitos", "error"); return }
    setSaving("pin")
    try {
      await api.put("/business/pin", pinForm)
      addToast("PIN actualizado", "success")
      setShowPinForm(false)
      setPinForm(prev => ({ ...prev, pin: "", confirm_pin: "" }))
    } catch { addToast("Error al guardar PIN", "error") }
    finally { setSaving(null) }
  }

  const addCategory = async () => {
    if (!newCategory.trim()) return
    setSaving("cat")
    try {
      await api.post("/categories", { name: newCategory.trim() })
      const res = await api.get("/categories")
      setData(prev => ({ ...prev, categories: res.data }))
      setNewCategory("")
      addToast("Categoría agregada", "success")
    } catch { addToast("Error al agregar categoría", "error") }
    finally { setSaving(null) }
  }

  const deleteCategory = async (id: number) => {
    setSaving("cat")
    try { await api.delete(`/categories/${id}`); setData(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) })) }
    catch { addToast("Error al eliminar categoría", "error") }
    finally { setSaving(null) }
  }

  const addUnit = async () => {
    if (!newUnitName.trim() || !newUnitAbbr.trim()) return
    setSaving("unit")
    try {
      await api.post("/units", { name: newUnitName.trim(), abbreviation: newUnitAbbr.trim() })
      const res = await api.get("/units")
      setData(prev => ({ ...prev, units: res.data }))
      setNewUnitName(""); setNewUnitAbbr("")
      addToast("Unidad agregada", "success")
    } catch { addToast("Error al agregar unidad", "error") }
    finally { setSaving(null) }
  }

  const deleteUnit = async (id: number) => {
    setSaving("unit")
    try { await api.delete(`/units/${id}`); setData(prev => ({ ...prev, units: prev.units.filter(u => u.id !== id) })) }
    catch { addToast("Error al eliminar unidad", "error") }
    finally { setSaving(null) }
  }

  const togglePaymentMethod = async (id: number, is_active: boolean) => {
    try {
      await api.patch(`/payment-methods/${id}/toggle`, { is_active })
      setData(prev => ({ ...prev, paymentMethods: prev.paymentMethods.map(pm => pm.id === id ? { ...pm, is_active } : pm) }))
    } catch { addToast("Error al actualizar método de pago", "error") }
  }

  const saveTaxConfig = async () => {
    setSaving("tax")
    try { const res = await api.put("/tax-config", taxForm); setData(prev => ({ ...prev, taxConfig: res.data })); addToast("Configuración de impuesto guardada", "success"); fetchAll() }
    catch { addToast("Error al guardar impuesto", "error") }
    finally { setSaving(null) }
  }

  const saveInvoicePrefs = async () => {
    setSaving("inv")
    try { const res = await api.put("/invoice-prefs", invoiceForm); setData(prev => ({ ...prev, invoicePrefs: res.data })); addToast("Preferencias de factura guardadas", "success"); fetchAll() }
    catch { addToast("Error al guardar preferencias", "error") }
    finally { setSaving(null) }
  }

  const exportAll = async () => {
    try {
      const res = await api.get("/export/all", { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href = url; a.download = "abyssal-export.zip"; a.click()
      window.URL.revokeObjectURL(url)
    } catch { addToast("Error al exportar", "error") }
  }

  const addCollaborator = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password.trim()) {
      addToast("Completa todos los campos obligatorios", "error")
      return
    }
    setSaving("collab")
    try {
      await api.post("/business/collaborators", userForm)
      addToast("Usuario agregado exitosamente", "success")
      setShowAddUser(false)
      setUserForm({ name: "", email: "", password: "", role: "Usuario" })
      fetchAll()
    } catch (err: any) {
      addToast(err.response?.data?.detail || "Error al agregar usuario", "error")
    } finally {
      setSaving(null)
    }
  }

  const deleteCollaborator = async (id: number) => {
    setSaving("collab")
    try {
      await api.delete(`/business/collaborators/${id}`)
      addToast("Usuario eliminado exitosamente", "success")
      fetchAll()
    } catch (err: any) {
      addToast(err.response?.data?.detail || "Error al eliminar usuario", "error")
    } finally {
      setSaving(null)
    }
  }

  const toggleCollabStatus = async (id: number) => {
    try {
      await api.patch(`/business/collaborators/${id}/toggle`)
      addToast("Estado de usuario actualizado", "success")
      fetchAll()
    } catch (err: any) {
      addToast(err.response?.data?.detail || "Error al actualizar estado", "error")
    }
  }

  const clearAllData = async () => {
    if (clearConfirmText !== "BORRAR") { addToast('Escribe "BORRAR" para confirmar', "error"); return }
    setSaving("clear")
    try { await api.delete("/data/clear-all"); addToast("Todos los datos han sido eliminados", "success"); setShowClearConfirm(false); setClearConfirmText(""); fetchAll() }
    catch { addToast("Error al limpiar datos", "error") }
    finally { setSaving(null) }
  }

  const roles = [
    { role: "Administrador", users: "3 usuarios", access: "Total" },
    { role: "Gerente", users: "5 usuarios", access: "Ventas, Finanzas" },
    { role: "Analista", users: "8 usuarios", access: "Reportes, Inventario" },
    { role: "Supervisor", users: "4 usuarios", access: "Órdenes, CRM" },
    { role: "Usuario", users: "6 usuarios", access: "Consultas básicas" },
  ]

  if (loading) {
    return (
      <>
        <TopBar title="Configuración" icon={<Settings size={18} />} />
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Configuración" icon={<Settings size={18} />} subtitle="Usuarios, roles y ajustes" />
      <div className="p-4 lg:p-8 space-y-6 pb-24">
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Configuración</h1>
            <p className="text-[14px] text-abyssal-text-secondary-variant font-body">Usuarios, roles y ajustes</p>
          </div>
            {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Usuarios Activos</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {data.collaborators.filter(c => c.is_active).length}
            </p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Roles Definidos</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {new Set(data.collaborators.map(c => c.role)).size || 1}
            </p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Usuarios Totales</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {data.collaborators.length}
            </p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">PIN de Caja</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {data.profile?.has_pin ? "Activo" : "Inactivo"}
            </p>
          </KpiCard>
        </div>

        {/* Usuarios + Ajustes row */}
        <div className="flex gap-5">
          {/* Usuarios del Sistema */}
          <div className="flex-1 bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Usuarios del Sistema</h3>
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 py-1 h-8"
                onClick={() => setShowAddUser(!showAddUser)}
              >
                {showAddUser ? <X size={14} /> : <Plus size={14} />}
                {showAddUser ? "Cancelar" : "Agregar"}
              </Button>
            </div>

            {showAddUser && (
              <form onSubmit={addCollaborator} className="mb-6 p-4 bg-abyssal-surface-high border border-abyssal-outline rounded-xl space-y-3">
                <h4 className="text-[13px] text-abyssal-text-primary font-heading font-semibold">Registrar Nuevo Usuario</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-abyssal-text-secondary font-medium">Nombre</label>
                    <Input
                      value={userForm.name}
                      onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: María Delgado"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-abyssal-text-secondary font-medium">Correo electrónico</label>
                    <Input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="m.delgado@..."
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-abyssal-text-secondary font-medium">Contraseña</label>
                    <Input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-abyssal-text-secondary font-medium">Rol</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full h-10 bg-abyssal-surface rounded-xl px-3 text-[13px] text-abyssal-text-primary outline-none border border-abyssal-outline appearance-none cursor-pointer"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Usuario">Usuario</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setShowAddUser(false)}>Cancelar</Button>
                  <Button variant="primary" size="sm" type="submit" loading={saving === "collab"}>Guardar Usuario</Button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-abyssal-outline">
                    <th className="text-left py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">USUARIO</th>
                    <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ROL</th>
                    <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {data.collaborators.length > 0 ? (
                    data.collaborators.map((u) => {
                      const isOwner = data.profile?.email === u.email
                      const isSelf = typeof window !== "undefined" && localStorage.getItem("abyssal-user-email") === u.email
                      return (
                        <tr key={u.id} className="border-b border-abyssal-outline">
                          <td className="py-3">
                            <p className="text-[13px] text-abyssal-text-primary font-body font-medium">{u.name}</p>
                            <p className="text-[11px] text-abyssal-text-secondary-variant font-mono">{u.email}</p>
                          </td>
                          <td className="py-3 text-right text-[13px] text-abyssal-text-secondary font-body">{u.role}</td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                disabled={isOwner || isSelf}
                                onClick={() => toggleCollabStatus(u.id)}
                                className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-caption font-medium transition-colors ${
                                  u.is_active 
                                    ? "bg-[rgba(34,197,94,0.1)] text-[#22c55e] hover:bg-[rgba(34,197,94,0.15)]" 
                                    : "bg-[rgba(239,68,68,0.1)] text-[#ef4444] hover:bg-[rgba(239,68,68,0.15)]"
                                } disabled:opacity-70 disabled:hover:bg-[rgba(34,197,94,0.1)]`}
                              >
                                {u.is_active ? "Activo" : "Inactivo"}
                              </button>
                              
                              <button
                                disabled={isOwner || isSelf}
                                onClick={() => deleteCollaborator(u.id)}
                                className="text-abyssal-text-secondary hover:text-[#ef4444] disabled:opacity-40 disabled:hover:text-abyssal-text-secondary p-1 rounded-lg hover:bg-abyssal-surface-high transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-[13px] text-abyssal-text-secondary-variant">
                        No hay usuarios registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>       </div>

          {/* Ajustes Generales */}
          <div className="w-[380px] shrink-0 bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
            <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold mb-5">Ajustes Generales</h3>
            <div className="space-y-0">
              {[
                { param: "Idioma", value: "Español" },
                { param: "Zona Horaria", value: "GMT-5 (Perú)" },
                { param: "Formato Moneda", value: "PEN (S/)" },
                { param: "Notificaciones", value: "Activadas" },
                { param: "Autenticación 2FA", value: "Desactivada" },
              ].map((item, i) => (
                <div key={item.param} className={`flex items-center justify-between py-3 ${i < 4 ? "border-b border-abyssal-outline" : ""}`}>
                  <span className="text-[13px] text-abyssal-text-primary font-body">{item.param}</span>
                  <span className="text-[12px] text-abyssal-text-secondary font-body">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Roles y Permisos */}
        <div className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
          <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold mb-5">Roles y Permisos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-abyssal-outline">
                  <th className="text-left py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ROL</th>
                  <th className="text-left py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">USUARIOS</th>
                  <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ACCESO</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r, i) => (
                  <tr key={i} className="border-b border-abyssal-outline">
                    <td className="py-4 text-[13px] text-abyssal-text-primary font-body font-medium">{r.role}</td>
                    <td className="py-4 text-[13px] text-abyssal-text-secondary font-body">{r.users}</td>
                    <td className="py-4 text-right text-[12px] text-abyssal-text-secondary-variant font-caption">{r.access}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All functional sections below */}
        <div className="space-y-4">
          <SectionCard title="Perfil del Negocio" icon={<Briefcase size={18} />}>
            <div className="space-y-3">
              <label className="text-[13px] text-abyssal-text-secondary block">Nombre del negocio</label>
              <Input value={profileForm.business_name} onChange={e => setProfileForm(p => ({ ...p, business_name: e.target.value }))} />
              <label className="text-[13px] text-abyssal-text-secondary block">Nombre del dueño</label>
              <Input value={profileForm.owner_name} onChange={e => setProfileForm(p => ({ ...p, owner_name: e.target.value }))} />
              <label className="text-[13px] text-abyssal-text-secondary block">Teléfono</label>
              <Input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
              <label className="text-[13px] text-abyssal-text-secondary block">Dirección</label>
              <Input value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} />
              <label className="text-[13px] text-abyssal-text-secondary block">Email</label>
              <Input value={data.profile?.email || ""} disabled />
              <Button variant="primary" onClick={saveProfile} loading={saving === "profile"}><Save size={16} /> Guardar cambios</Button>
            </div>
          </SectionCard>

          <SectionCard title="Categorías de Productos" icon={<Package size={18} />}>
            <div className="flex flex-wrap gap-2">
              {data.categories.map(cat => (
                <span key={cat.id} className="inline-flex items-center gap-1 bg-abyssal-surface-high text-abyssal-text-primary rounded-full px-3 py-1 text-[13px]">
                  {cat.name}
                  <button onClick={() => deleteCategory(cat.id)} className="p-0.5 hover:bg-abyssal-surface-highest rounded-full"><X size={14} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Nueva categoría" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="flex-1" />
              <Button variant="primary" onClick={addCategory} loading={saving === "cat"}><Plus size={16} /></Button>
            </div>
          </SectionCard>

          <SectionCard title="Unidades de Medida" icon={<Ruler size={18} />}>
            <div className="flex flex-wrap gap-2">
              {data.units.map(u => (
                <span key={u.id} className="inline-flex items-center gap-1 bg-abyssal-surface-high text-abyssal-text-primary rounded-full px-3 py-1 text-[13px]">
                  {u.name} ({u.abbreviation})
                  <button onClick={() => deleteUnit(u.id)} className="p-0.5 hover:bg-abyssal-surface-highest rounded-full"><X size={14} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Nombre" value={newUnitName} onChange={e => setNewUnitName(e.target.value)} className="flex-1" />
              <Input placeholder="Abrev." value={newUnitAbbr} onChange={e => setNewUnitAbbr(e.target.value)} className="w-20" />
              <Button variant="primary" onClick={addUnit} loading={saving === "unit"}><Plus size={16} /></Button>
            </div>
          </SectionCard>

          <SectionCard title="Métodos de Pago" icon={<CreditCard size={18} />}>
            <div className="space-y-2">
              {data.paymentMethods.map((pm, idx) => (
                <div key={pm.id} className="flex items-center justify-between p-2 bg-abyssal-surface-high rounded-xl">
                  <span className="text-[13px] text-abyssal-text-primary">{pm.name}</span>
                  <button onClick={() => togglePaymentMethod(pm.id, !pm.is_active)}
                    className={`w-10 h-6 rounded-full transition-colors ${pm.is_active ? 'bg-abyssal-primary' : 'bg-abyssal-surface-highest'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${pm.is_active ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Impuesto / IVA" icon={<Percent size={18} />}>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-[13px] text-abyssal-text-primary">Aplicar impuesto</span>
                <button onClick={() => setTaxForm(t => ({ ...t, is_enabled: !t.is_enabled }))}
                  className={`w-10 h-6 rounded-full transition-colors ${taxForm.is_enabled ? 'bg-abyssal-primary' : 'bg-abyssal-surface-highest'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${taxForm.is_enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                </button>
              </label>
              {taxForm.is_enabled && (
                <>
                  <label className="text-[13px] text-abyssal-text-secondary block">Nombre del impuesto</label>
                  <Input value={taxForm.name} onChange={e => setTaxForm(t => ({ ...t, name: e.target.value }))} />
                  <label className="text-[13px] text-abyssal-text-secondary block">Porcentaje (%)</label>
                  <Input type="number" value={taxForm.rate} onChange={e => setTaxForm(t => ({ ...t, rate: parseFloat(e.target.value) || 0 }))} />
                  <label className="flex items-center justify-between">
                    <span className="text-[13px] text-abyssal-text-primary">Los precios ya incluyen impuesto</span>
                    <button onClick={() => setTaxForm(t => ({ ...t, included_in_price: !t.included_in_price }))}
                      className={`w-10 h-6 rounded-full transition-colors ${taxForm.included_in_price ? 'bg-abyssal-primary' : 'bg-abyssal-surface-highest'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${taxForm.included_in_price ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                    </button>
                  </label>
                </>
              )}
              <Button variant="primary" onClick={saveTaxConfig} loading={saving === "tax"}><Save size={16} /> Guardar</Button>
            </div>
          </SectionCard>

          <SectionCard title="PIN de Caja" icon={<Key size={18} />}>
            <div className="space-y-3">
              <p className="text-[13px] text-abyssal-text-secondary">{data.profile?.has_pin ? "PIN configurado" : "PIN no configurado"}</p>
              {showPinForm ? (
                <div className="space-y-3">
                  <label className="text-[13px] text-abyssal-text-secondary block">Nuevo PIN (4 dígitos)</label>
                  <Input type="password" maxLength={4} value={pinForm.pin} onChange={e => setPinForm(p => ({ ...p, pin: e.target.value }))} />
                  <label className="text-[13px] text-abyssal-text-secondary block">Confirmar PIN</label>
                  <Input type="password" maxLength={4} value={pinForm.confirm_pin} onChange={e => setPinForm(p => ({ ...p, confirm_pin: e.target.value }))} />
                  <label className="flex items-center justify-between">
                    <span className="text-[13px] text-abyssal-text-primary">Requerir PIN para cerrar caja</span>
                    <button onClick={() => setPinForm(p => ({ ...p, require_pin: !p.require_pin }))}
                      className={`w-10 h-6 rounded-full transition-colors ${pinForm.require_pin ? 'bg-abyssal-primary' : 'bg-abyssal-surface-highest'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${pinForm.require_pin ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                    </button>
                  </label>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => { setShowPinForm(false); setPinForm(p => ({ ...p, pin: "", confirm_pin: "" })) }}>Cancelar</Button>
                    <Button variant="primary" onClick={savePin} loading={saving === "pin"}>Guardar PIN</Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" onClick={() => setShowPinForm(true)}><Key size={16} /> {data.profile?.has_pin ? "Cambiar PIN" : "Configurar PIN"}</Button>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Preferencias de Factura" icon={<FileText size={18} />}>
            <div className="space-y-3">
              <div>
                <label className="text-[13px] text-abyssal-text-secondary block">Footer del ticket</label>
                <textarea className="w-full bg-abyssal-surface-high text-abyssal-text-primary rounded-xl p-3 text-[13px] resize-none h-20 outline-none ring-1 ring-abyssal-primary/20 focus:ring-abyssal-primary"
                  value={invoiceForm.footer_text} onChange={e => setInvoiceForm(f => ({ ...f, footer_text: e.target.value }))}
                  placeholder="Texto al pie de cada factura..." />
              </div>
              <label className="flex items-center justify-between">
                <span className="text-[13px] text-abyssal-text-primary">Mostrar desglose de impuesto</span>
                <button onClick={() => setInvoiceForm(f => ({ ...f, show_tax_breakdown: !f.show_tax_breakdown }))}
                  className={`w-10 h-6 rounded-full transition-colors ${invoiceForm.show_tax_breakdown ? 'bg-abyssal-primary' : 'bg-abyssal-surface-highest'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${invoiceForm.show_tax_breakdown ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                </button>
              </label>
              <Button variant="primary" onClick={saveInvoicePrefs} loading={saving === "inv"}><Save size={16} /> Guardar</Button>
            </div>
          </SectionCard>

          <SectionCard title="Exportar Datos" icon={<Download size={18} />}>
            <Button variant="primary" onClick={exportAll}><Download size={16} /> Todo (ZIP)</Button>
          </SectionCard>

          <SectionCard title="Información" icon={<Info size={18} />}>
            <div className="space-y-1 text-[13px] text-abyssal-text-secondary">
              <p><span className="text-abyssal-text-primary">App:</span> PESCAMAR ERP</p>
              <p><span className="text-abyssal-text-primary">Versión:</span> 1.0.0</p>
              <p><span className="text-abyssal-text-primary">Stack:</span> Next.js + FastAPI</p>
            </div>
          </SectionCard>

          <SectionCard title="Limpiar Datos" icon={<Trash2 size={18} />}>
            <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl space-y-3">
              <p className="text-[13px] text-[#ef4444]">Esta acción eliminará todos los datos transaccionales. No se puede deshacer.</p>
              {showClearConfirm ? (
                <div className="space-y-2">
                  <p className="text-[12px] text-abyssal-text-secondary">Escribe <strong>BORRAR</strong> para confirmar:</p>
                  <Input value={clearConfirmText} onChange={e => setClearConfirmText(e.target.value)} placeholder="BORRAR" />
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => { setShowClearConfirm(false); setClearConfirmText("") }}>Cancelar</Button>
                    <Button variant="primary" className="bg-[#ef4444] hover:bg-[#ef4444]/90" onClick={clearAllData} loading={saving === "clear"}>
                      <Trash2 size={16} /> Eliminar todo
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" className="border-[rgba(239,68,68,0.3)] text-[#ef4444]" onClick={() => setShowClearConfirm(true)}>
                  <Trash2 size={16} /> Limpiar todos los datos
                </Button>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}