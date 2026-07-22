"use client"

import { useState, useEffect, useCallback } from "react"
import { Settings, Save, Plus, X, ChevronUp, ChevronDown, Download, Trash2, Key, FileText, Briefcase, Package, Ruler, CreditCard, Percent, Info } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { TopBar } from "@/components/layout/TopBar"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import api from "@/lib/api"
import type { BusinessProfile, Category, Unit, PaymentMethod, TaxConfig, InvoicePrefs } from "@/lib/types"

type SettingsData = {
  profile: BusinessProfile | null
  categories: Category[]
  units: Unit[]
  paymentMethods: PaymentMethod[]
  taxConfig: TaxConfig | null
  invoicePrefs: InvoicePrefs | null
}

export default function SettingsPage() {
  const { toasts, addToast, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SettingsData>({ profile: null, categories: [], units: [], paymentMethods: [], taxConfig: null, invoicePrefs: null })
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

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [profileRes, catsRes, unitsRes, pmRes, taxRes, invRes] = await Promise.all([
        api.get("/business/profile").catch(() => ({ data: null })),
        api.get("/categories").catch(() => ({ data: [] })),
        api.get("/units").catch(() => ({ data: [] })),
        api.get("/payment-methods").catch(() => ({ data: [] })),
        api.get("/tax-config").catch(() => ({ data: null })),
        api.get("/invoice-prefs").catch(() => ({ data: null })),
      ])
      const profile = profileRes.data
      setData({ profile, categories: catsRes.data, units: unitsRes.data, paymentMethods: pmRes.data, taxConfig: taxRes.data, invoicePrefs: invRes.data })
      if (profile) {
        setProfileForm({ business_name: profile.business_name, owner_name: profile.owner_name, phone: profile.phone || "", address: profile.address || "" })
        setPinForm(prev => ({ ...prev, require_pin: profile.require_pin }))
      }
      if (taxRes.data) setTaxForm({ is_enabled: taxRes.data.is_enabled, name: taxRes.data.name, rate: taxRes.data.rate, included_in_price: taxRes.data.included_in_price })
      if (invRes.data) setInvoiceForm({ footer_text: invRes.data.footer_text, show_tax_breakdown: invRes.data.show_tax_breakdown, default_payment_method_id: invRes.data.default_payment_method_id })
    } catch {
      addToast("Error al cargar configuración", "error")
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { fetchAll() }, [fetchAll])

  const saveProfile = async () => {
    setSaving("profile")
    try {
      await api.put("/business/profile", profileForm)
      addToast("Perfil actualizado", "success")
    } catch { addToast("Error al guardar perfil", "error") }
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
    try {
      await api.delete(`/categories/${id}`)
      setData(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }))
    } catch { addToast("Error al eliminar categoría", "error") }
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
    try {
      await api.delete(`/units/${id}`)
      setData(prev => ({ ...prev, units: prev.units.filter(u => u.id !== id) }))
    } catch { addToast("Error al eliminar unidad", "error") }
    finally { setSaving(null) }
  }

  const togglePaymentMethod = async (id: number, is_active: boolean) => {
    try {
      await api.patch(`/payment-methods/${id}/toggle`, { is_active })
      setData(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.map(pm => pm.id === id ? { ...pm, is_active } : pm)
      }))
    } catch { addToast("Error al actualizar método de pago", "error") }
  }

  const movePaymentMethod = async (index: number, direction: "up" | "down") => {
    const methods = [...data.paymentMethods]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= methods.length) return;
    [methods[index], methods[target]] = [methods[target], methods[index]]
    const reordered = methods.map((m, i) => ({ ...m, sort_order: i }))
    setData(prev => ({ ...prev, paymentMethods: reordered }))
    try {
      await api.put("/payment-methods/reorder", { ids: reordered.map(m => m.id) })
    } catch { addToast("Error al reordenar", "error"); fetchAll() }
  }

  const saveTaxConfig = async () => {
    setSaving("tax")
    try {
      const res = await api.put("/tax-config", taxForm)
      setData(prev => ({ ...prev, taxConfig: res.data }))
      addToast("Configuración de impuesto guardada", "success")
    } catch { addToast("Error al guardar impuesto", "error") }
    finally { setSaving(null) }
  }

  const saveInvoicePrefs = async () => {
    setSaving("inv")
    try {
      const res = await api.put("/invoice-prefs", invoiceForm)
      setData(prev => ({ ...prev, invoicePrefs: res.data }))
      addToast("Preferencias de factura guardadas", "success")
    } catch { addToast("Error al guardar preferencias", "error") }
    finally { setSaving(null) }
  }

  const exportData = async (entity: string) => {
    try {
      const res = await api.get(`/export/${entity}`, { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href = url; a.download = `${entity}.csv`; a.click()
      window.URL.revokeObjectURL(url)
    } catch { addToast("Error al exportar", "error") }
  }

  const exportAll = async () => {
    try {
      const res = await api.get("/export/all", { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href = url; a.download = "abyssal-export.zip"; a.click()
      window.URL.revokeObjectURL(url)
    } catch { addToast("Error al exportar", "error") }
  }

  const clearAllData = async () => {
    if (clearConfirmText !== "BORRAR") { addToast('Escribe "BORRAR" para confirmar', "error"); return }
    setSaving("clear")
    try {
      await api.delete("/data/clear-all")
      addToast("Todos los datos han sido eliminados", "success")
      setShowClearConfirm(false)
      setClearConfirmText("")
    } catch { addToast("Error al limpiar datos", "error") }
    finally { setSaving(null) }
  }

  const SectionCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-title-medium text-abyssal-text-primary font-semibold">
        <span className="text-abyssal-primary">{icon}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </Card>
  )

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
      <TopBar title="Configuración" icon={<Settings size={18} />} />
      <div className="p-4 space-y-4 pb-24">

        {/* 1. Perfil del Negocio */}
        <SectionCard title="Perfil del Negocio" icon={<Briefcase size={18} />}>
          <div className="space-y-3">
            <label className="text-sm text-abyssal-text-secondary mb-1 block">Nombre del negocio</label>
            <Input value={profileForm.business_name} onChange={e => setProfileForm(p => ({ ...p, business_name: e.target.value }))} />
            <label className="text-sm text-abyssal-text-secondary mb-1 block">Nombre del dueño</label>
            <Input value={profileForm.owner_name} onChange={e => setProfileForm(p => ({ ...p, owner_name: e.target.value }))} />
            <label className="text-sm text-abyssal-text-secondary mb-1 block">Teléfono</label>
            <Input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
            <label className="text-sm text-abyssal-text-secondary mb-1 block">Dirección</label>
            <Input value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} />
            <label className="text-sm text-abyssal-text-secondary mb-1 block">Email</label>
            <Input value={data.profile?.email || ""} disabled />
            <Button variant="primary" onClick={saveProfile} loading={saving === "profile"}>
              <Save size={16} /> Guardar cambios
            </Button>
          </div>
        </SectionCard>

        {/* 2. Categorías de Productos */}
        <SectionCard title="Categorías de Productos" icon={<Package size={18} />}>
          <div className="flex flex-wrap gap-2">
            {data.categories.map(cat => (
              <span key={cat.id} className="inline-flex items-center gap-1 bg-abyssal-surface-high text-abyssal-text-primary rounded-full px-3 py-1 text-sm">
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

        {/* 3. Unidades de Medida */}
        <SectionCard title="Unidades de Medida" icon={<Ruler size={18} />}>
          <div className="flex flex-wrap gap-2">
            {data.units.map(u => (
              <span key={u.id} className="inline-flex items-center gap-1 bg-abyssal-surface-high text-abyssal-text-primary rounded-full px-3 py-1 text-sm">
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

        {/* 4. Métodos de Pago */}
        <SectionCard title="Métodos de Pago" icon={<CreditCard size={18} />}>
          <div className="space-y-2">
            {data.paymentMethods.map((pm, idx) => (
              <div key={pm.id} className="flex items-center justify-between p-2 bg-abyssal-surface-high rounded-xl">
                <span className="text-sm text-abyssal-text-primary">{pm.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => movePaymentMethod(idx, "up")} disabled={idx === 0} className="p-1 hover:bg-abyssal-surface-highest rounded disabled:opacity-30"><ChevronUp size={16} /></button>
                  <button onClick={() => movePaymentMethod(idx, "down")} disabled={idx === data.paymentMethods.length - 1} className="p-1 hover:bg-abyssal-surface-highest rounded disabled:opacity-30"><ChevronDown size={16} /></button>
                  <button onClick={() => togglePaymentMethod(pm.id, !pm.is_active)} className={`w-10 h-6 rounded-full transition-colors ${pm.is_active ? 'bg-abyssal-primary' : 'bg-abyssal-surface-highest'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${pm.is_active ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 5. Impuesto / IVA */}
        <SectionCard title="Impuesto / IVA" icon={<Percent size={18} />}>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-abyssal-text-primary">Aplicar impuesto</span>
              <button onClick={() => setTaxForm(t => ({ ...t, is_enabled: !t.is_enabled }))} className={`w-10 h-6 rounded-full transition-colors ${taxForm.is_enabled ? 'bg-abyssal-primary' : 'bg-abyssal-surface-highest'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${taxForm.is_enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
              </button>
            </label>
            {taxForm.is_enabled && (
              <>
                <label className="text-sm text-abyssal-text-secondary mb-1 block">Nombre del impuesto</label>
                <Input value={taxForm.name} onChange={e => setTaxForm(t => ({ ...t, name: e.target.value }))} />
                <label className="text-sm text-abyssal-text-secondary mb-1 block">Porcentaje (%)</label>
                <Input type="number" value={taxForm.rate} onChange={e => setTaxForm(t => ({ ...t, rate: parseFloat(e.target.value) || 0 }))} />
                <label className="flex items-center justify-between">
                  <span className="text-sm text-abyssal-text-primary">Los precios ya incluyen impuesto</span>
                  <button onClick={() => setTaxForm(t => ({ ...t, included_in_price: !t.included_in_price }))} className={`w-10 h-6 rounded-full transition-colors ${taxForm.included_in_price ? 'bg-abyssal-primary' : 'bg-abyssal-surface-highest'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${taxForm.included_in_price ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                  </button>
                </label>
              </>
            )}
            <Button variant="primary" onClick={saveTaxConfig} loading={saving === "tax"}>
              <Save size={16} /> Guardar
            </Button>
          </div>
        </SectionCard>

        {/* 6. PIN de Caja */}
        <SectionCard title="PIN de Caja" icon={<Key size={18} />}>
          <div className="space-y-3">
            <p className="text-sm text-abyssal-text-secondary">
              {data.profile?.has_pin ? "PIN configurado" : "PIN no configurado"}
            </p>
            {showPinForm ? (
              <div className="space-y-3">
                <label className="text-sm text-abyssal-text-secondary mb-1 block">Nuevo PIN (4 dígitos)</label>
                <Input type="password" maxLength={4} value={pinForm.pin} onChange={e => setPinForm(p => ({ ...p, pin: e.target.value }))} />
                <label className="text-sm text-abyssal-text-secondary mb-1 block">Confirmar PIN</label>
                <Input type="password" maxLength={4} value={pinForm.confirm_pin} onChange={e => setPinForm(p => ({ ...p, confirm_pin: e.target.value }))} />
                <label className="flex items-center justify-between">
                  <span className="text-sm text-abyssal-text-primary">Requerir PIN para cerrar caja</span>
                  <button onClick={() => setPinForm(p => ({ ...p, require_pin: !p.require_pin }))} className={`w-10 h-6 rounded-full transition-colors ${pinForm.require_pin ? 'bg-abyssal-primary' : 'bg-abyssal-surface-highest'}`}>
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

        {/* 7. Preferencias de Factura */}
        <SectionCard title="Preferencias de Factura" icon={<FileText size={18} />}>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-abyssal-text-secondary mb-1 block">Footer del ticket</label>
              <textarea
                className="w-full bg-abyssal-surface-high text-abyssal-text-primary rounded-xl p-3 text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-abyssal-primary/20"
                value={invoiceForm.footer_text}
                onChange={e => setInvoiceForm(f => ({ ...f, footer_text: e.target.value }))}
                placeholder="Texto al pie de cada factura..."
              />
            </div>
            <label className="flex items-center justify-between">
              <span className="text-sm text-abyssal-text-primary">Mostrar desglose de impuesto</span>
              <button onClick={() => setInvoiceForm(f => ({ ...f, show_tax_breakdown: !f.show_tax_breakdown }))} className={`w-10 h-6 rounded-full transition-colors ${invoiceForm.show_tax_breakdown ? 'bg-abyssal-primary' : 'bg-abyssal-surface-highest'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${invoiceForm.show_tax_breakdown ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
              </button>
            </label>
            <Button variant="primary" onClick={saveInvoicePrefs} loading={saving === "inv"}>
              <Save size={16} /> Guardar
            </Button>
          </div>
        </SectionCard>

        {/* 8. Exportar Datos */}
        <SectionCard title="Exportar Datos" icon={<Download size={18} />}>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => exportData("productos")}><Download size={16} /> Productos</Button>
            <Button variant="secondary" onClick={() => exportData("clientes")}><Download size={16} /> Clientes</Button>
            <Button variant="secondary" onClick={() => exportData("pedidos")}><Download size={16} /> Pedidos</Button>
            <Button variant="primary" onClick={exportAll}><Download size={16} /> Todo (ZIP)</Button>
          </div>
        </SectionCard>

        {/* 9. Información de la App */}
        <SectionCard title="Información de la App" icon={<Info size={18} />}>
          <div className="space-y-1 text-sm text-abyssal-text-secondary">
            <p><span className="text-abyssal-text-primary">App:</span> Abyssal ERP</p>
            <p><span className="text-abyssal-text-primary">Versión:</span> 1.0.0</p>
            <p><span className="text-abyssal-text-primary">Stack:</span> Next.js + FastAPI</p>
          </div>
        </SectionCard>

        {/* 10. Limpiar Datos */}
        <SectionCard title="Limpiar Datos" icon={<Trash2 size={18} />}>
          <div className="p-3 bg-abyssal-red-bg border border-abyssal-red/20 rounded-xl space-y-3">
            <p className="text-sm text-abyssal-red">
              Esta acción eliminará todos los datos transaccionales (productos, clientes, pedidos, compras, transacciones). El perfil del negocio y la configuración se mantienen. Esta operación no se puede deshacer.
            </p>
            {showClearConfirm ? (
              <div className="space-y-2">
                <p className="text-xs text-abyssal-text-secondary">Escribe <strong>BORRAR</strong> para confirmar:</p>
                <Input value={clearConfirmText} onChange={e => setClearConfirmText(e.target.value)} placeholder="BORRAR" />
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => { setShowClearConfirm(false); setClearConfirmText("") }}>Cancelar</Button>
                  <Button variant="primary" className="bg-abyssal-red hover:bg-abyssal-red/90" onClick={clearAllData} loading={saving === "clear"}>
                    <Trash2 size={16} /> Eliminar todo
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" className="border-abyssal-red/30 text-abyssal-red" onClick={() => setShowClearConfirm(true)}>
                <Trash2 size={16} /> Limpiar todos los datos
              </Button>
            )}
          </div>
        </SectionCard>

      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
