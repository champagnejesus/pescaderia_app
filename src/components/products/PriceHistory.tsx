'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePurchasePrices } from '@/hooks/usePurchasePrices';
import { AlertTriangle } from 'lucide-react';

interface PriceHistoryProps {
  productId: number;
}

export default function PriceHistory({ productId }: PriceHistoryProps) {
  const { history, alert, loading } = usePurchasePrices(productId);

  if (loading) {
    return <div className="text-gray-400 text-center py-4">Cargando historial...</div>;
  }

  if (!history || history.prices.length === 0) {
    return <p className="text-gray-500 text-sm">No hay historial de precios</p>;
  }

  const chartData = history.prices
    .slice()
    .reverse()
    .map((p) => ({
      date: new Date(p.recorded_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      precio: p.unit_price,
      promedio: history.avg_price,
    }));

  return (
    <div className="space-y-4">
      {alert?.has_alert && (
        <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <AlertTriangle size={16} className="text-orange-400" />
          <p className="text-orange-400 text-sm">{alert.message}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-gray-400 text-xs">Promedio</p>
          <p className="text-white font-semibold">${history.avg_price.toFixed(2)}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-gray-400 text-xs">Mínimo</p>
          <p className="text-green-400 font-semibold">${history.min_price.toFixed(2)}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-gray-400 text-xs">Máximo</p>
          <p className="text-red-400 font-semibold">${history.max_price.toFixed(2)}</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Line type="monotone" dataKey="precio" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
            <Line type="monotone" dataKey="promedio" stroke="#6b7280" strokeWidth={1} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="text-left py-2">Fecha</th>
              <th className="text-left py-2">Proveedor</th>
              <th className="text-right py-2">Precio</th>
              <th className="text-right py-2">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {history.prices.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="py-2 text-gray-300">{new Date(p.recorded_at).toLocaleDateString('es-ES')}</td>
                <td className="py-2 text-gray-300">{p.supplier_name || '-'}</td>
                <td className="py-2 text-right text-white">${p.unit_price.toFixed(2)}</td>
                <td className="py-2 text-right text-gray-300">{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
