'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useInventoryAdjustments } from '@/hooks/useInventoryAdjustments';

interface Product {
  id: number;
  name: string;
  stock: number;
  unit: string;
}

interface PhysicalCountModalProps {
  products: Product[];
  onClose: () => void;
  onCount: () => void;
}

export default function PhysicalCountModal({ products, onClose, onCount }: PhysicalCountModalProps) {
  const { physicalCount, loading } = useInventoryAdjustments();
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState('');

  const handleCountChange = (productId: number, value: string) => {
    setCounts((prev) => ({
      ...prev,
      [productId]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async () => {
    const entries = Object.entries(counts).filter(([_, qty]) => qty > 0);

    for (const [productId, actualQuantity] of entries) {
      await physicalCount(Number(productId), actualQuantity, notes);
    }

    onCount();
    onClose();
  };

  const hasChanges = Object.keys(counts).length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0a1628] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Conteo Físico</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Ingresa la cantidad física real de cada producto. El sistema calculará la diferencia automáticamente.
        </p>

        <div className="space-y-3 mb-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
              <div className="flex-1">
                <p className="text-white font-medium">{product.name}</p>
                <p className="text-gray-400 text-sm">Stock actual: {product.stock} {product.unit}</p>
              </div>
              <div className="w-32">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Cantidad real"
                  onChange={(e) => handleCountChange(product.id, e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              {counts[product.id] !== undefined && (
                <div className={`text-sm font-medium ${counts[product.id] >= product.stock ? 'text-green-400' : 'text-red-400'}`}>
                  {counts[product.id] >= product.stock ? '+' : ''}{(counts[product.id] - product.stock).toFixed(2)} {product.unit}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            rows={2}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !hasChanges}
            className="flex-1 px-4 py-2 bg-cyan-500 rounded-lg text-white font-medium hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrar Conteo'}
          </button>
        </div>
      </div>
    </div>
  );
}
