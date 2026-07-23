'use client';

import { useEffect, useState } from 'react';
import { useInventoryAdjustments, Adjustment } from '@/hooks/useInventoryAdjustments';

interface AdjustmentHistoryProps {
  productId?: number;
}

export default function AdjustmentHistory({ productId }: AdjustmentHistoryProps) {
  const { getAdjustments } = useInventoryAdjustments();
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdjustments();
  }, [productId]);

  const loadAdjustments = async () => {
    setLoading(true);
    const data = await getAdjustments(productId);
    setAdjustments(data.adjustments);
    setTotal(data.total);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-gray-400 text-center py-4">Cargando historial...</div>;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-400 mb-3">Historial de Ajustes ({total})</h4>
      {adjustments.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay ajustes registrados</p>
      ) : (
        <div className="space-y-2">
          {adjustments.map((adj) => (
            <div key={adj.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white text-sm font-medium">{adj.product_name}</p>
                <p className="text-gray-400 text-xs">
                  {adj.type} — {adj.reason} — {new Date(adj.created_at).toLocaleDateString('es-ES')}
                </p>
                {adj.notes && <p className="text-gray-500 text-xs mt-1">{adj.notes}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  {adj.quantity_before} → {adj.quantity_after}
                </p>
                <p className={`text-sm font-medium ${adj.quantity_adjusted >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {adj.quantity_adjusted >= 0 ? '+' : ''}{adj.quantity_adjusted}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
