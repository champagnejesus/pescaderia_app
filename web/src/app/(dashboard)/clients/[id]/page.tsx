import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Detalle Cliente",
}

export default function ClientDetail({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-[#121212] font-['Inter'] text-[#e4e1ed] selection:bg-[#c2c1ff]/30 pb-[100px]">
      <style dangerouslySetInnerHTML={{__html: `
        .ios-blur {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .active-scale:active {
            transform: scale(0.96);
            transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}} />

      {/* Top App Bar */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] z-50 bg-[#13131b]/80 ios-blur border-b border-[#464554]/30 h-[64px] flex items-center justify-between px-[20px]">
        <Link href="/clients" className="active-scale text-[#c2c1ff] flex items-center">
          <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>chevron_left</span>
        </Link>
        <h1 className="text-[20px] leading-[25px] font-semibold text-[#e4e1ed] truncate px-4">Juan Rodríguez</h1>
        <button className="active-scale text-[#c2c1ff] text-[17px] leading-[22px] font-semibold">
          Editar
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-[84px] pb-[20px] max-w-[400px] mx-auto px-[20px] flex flex-col gap-[12px]">
        {/* Saldo Destacado (Bento Card) */}
        <section className="relative overflow-hidden bg-[#5e5ce6] rounded-[3rem] p-6 flex flex-col justify-between h-[180px] shadow-2xl">
          <div className="z-10">
            <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-white/70 uppercase">Saldo Pendiente</span>
            <div className="text-[34px] leading-[41px] tracking-[-0.02em] font-bold text-white mt-1">€450.00</div>
          </div>
          <div className="z-10 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-white/60">Límite de crédito</span>
              <span className="text-[15px] leading-[20px] font-normal text-white">€1,500.00</span>
            </div>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full text-[17px] leading-[22px] font-semibold active-scale">
              Pagar
            </button>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#47e266]/20 rounded-full blur-2xl"></div>
        </section>

        {/* Action Buttons Grid */}
        <section className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center justify-center bg-[#1f1f27] rounded-lg p-4 gap-2 active-scale border border-[#464554]/30">
            <div className="w-10 h-10 rounded-full bg-[#09bf49]/20 flex items-center justify-center text-[#47e266]">
              <span className="material-symbols-outlined">call</span>
            </div>
            <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#c7c4d7]">Llamar</span>
          </button>
          <button className="flex flex-col items-center justify-center bg-[#1f1f27] rounded-lg p-4 gap-2 active-scale border border-[#464554]/30">
            <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
              <span className="material-symbols-outlined">chat</span>
            </div>
            <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#c7c4d7]">WhatsApp</span>
          </button>
          <button className="flex flex-col items-center justify-center bg-[#5e5ce6] rounded-lg p-4 gap-2 active-scale">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <span className="material-symbols-outlined">add_shopping_cart</span>
            </div>
            <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-white/90">Pedido</span>
          </button>
        </section>

        {/* Información de Contacto */}
        <section className="flex flex-col gap-3 mt-4">
          <h2 className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0] uppercase px-1">Información de Contacto</h2>
          <div className="bg-[#1f1f27] rounded-xl overflow-hidden border border-[#464554]/30">
            {/* Row 1: Teléfono */}
            <div className="flex items-center p-4 gap-4 border-b border-[#464554]/20 active:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-[#c2c1ff]">phone_iphone</span>
              <div className="flex flex-col">
                <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0]">Teléfono</span>
                <span className="text-[15px] leading-[20px] font-normal">+34 612 345 678</span>
              </div>
            </div>
            {/* Row 2: Email */}
            <div className="flex items-center p-4 gap-4 border-b border-[#464554]/20 active:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-[#c2c1ff]">mail</span>
              <div className="flex flex-col">
                <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0]">Email</span>
                <span className="text-[15px] leading-[20px] font-normal">juan.rodriguez@pescaexpress.es</span>
              </div>
            </div>
            {/* Row 3: Dirección */}
            <div className="flex items-center p-4 gap-4 active:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-[#c2c1ff]">location_on</span>
              <div className="flex flex-col">
                <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0]">Dirección</span>
                <span className="text-[15px] leading-[20px] font-normal">Calle del Mar, 12. Mercamadrid, Nave 4.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Últimos Pedidos */}
        <section className="flex flex-col gap-3 mt-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0] uppercase">Últimos Pedidos</h2>
            <button className="text-[13px] leading-[18px] font-normal text-[#c2c1ff]">Ver todos</button>
          </div>
          <div className="flex flex-col gap-3">
            {/* Pedido Item 1 */}
            <div className="bg-[#2a2932] rounded-lg p-4 flex items-center justify-between border border-[#464554]/30 active-scale">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#34343d] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#918fa0]">inventory_2</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[17px] leading-[22px] font-semibold">Orden #8842</span>
                  <span className="text-[13px] leading-[18px] font-normal text-[#918fa0]">Hoy, 09:15 AM</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[17px] leading-[22px] font-semibold">€124.50</span>
                <span className="bg-[#09bf49]/20 text-[#47e266] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Entregado</span>
              </div>
            </div>
            {/* Pedido Item 2 */}
            <div className="bg-[#2a2932] rounded-lg p-4 flex items-center justify-between border border-[#464554]/30 active-scale">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#34343d] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#918fa0]">inventory_2</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[17px] leading-[22px] font-semibold">Orden #8839</span>
                  <span className="text-[13px] leading-[18px] font-normal text-[#918fa0]">Ayer, 14:30 PM</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[17px] leading-[22px] font-semibold">€325.50</span>
                <span className="bg-[#caa900]/20 text-[#eac400] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Pendiente</span>
              </div>
            </div>
            {/* Pedido Item 3 */}
            <div className="bg-[#2a2932] rounded-lg p-4 flex items-center justify-between border border-[#464554]/30 active-scale">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#34343d] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#918fa0]">inventory_2</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[17px] leading-[22px] font-semibold">Orden #8820</span>
                  <span className="text-[13px] leading-[18px] font-normal text-[#918fa0]">12 Oct 2023</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[17px] leading-[22px] font-semibold">€89.20</span>
                <span className="bg-[#09bf49]/20 text-[#47e266] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Entregado</span>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section (Simulated) */}
        <section className="flex flex-col gap-3 mt-4">
          <h2 className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0] uppercase px-1">Ruta de Entrega</h2>
          <div className="w-full h-40 rounded-xl overflow-hidden border border-[#464554]/30 relative active-scale bg-gray-800">
            <div className="absolute inset-0 bg-gradient-to-t from-[#13131b] to-transparent opacity-60 z-10"></div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#1f1f27]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#464554]/30 z-20">
              <span className="material-symbols-outlined text-[#c2c1ff] text-sm">navigation</span>
              <span className="text-[13px] leading-[18px] font-normal text-[#e4e1ed]">Ver en mapa</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
