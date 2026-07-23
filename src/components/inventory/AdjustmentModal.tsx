'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useInventoryAdjustments } from '@/hooks/useInventoryAdjustments';

interface AdjustmentModalProps {
  productId: number;
  productName: string;
  currentStock: number;
  onClose: () => void;
  onAdjustment: () => void;
}

export default function AdjustmentModal({ productId, productName, currentStock, onClose, onAdjustment }: AdjustmentModalProps) {
  const { adjustStock, loading } = useInventoryAdjustments();
  const [quantityChange, setQuantityChange] = useState<number>(0);
  const [reason, setReason] = useState('Corrección');
  const [notes, setNotes] = useState('');

  const reasons = ['Mermas', 'Daño', 'Conteo', 'Corrección'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityChange === 0) return;

    await adjustStock(productId, quantityChange, reason, notes);
    onAdjustment();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0a1628] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Ajustar Stock</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <p className="text-gray-400 text-sm">{productName}</p>
          <p className="text-2xl font-bold text-cyan-400">{currentStock} kg</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Cantidad (+ para agregar, - para restar)</label>
            <input
              type="number"
              step="0.01"
              value={quantityChange}
              onChange={(e) => setQuantityChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Stock resultante: {currentStock + quantityChange} kg
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Razón</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
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
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || quantityChange === 0}
              className="flex-1 px-4 py-2 bg-cyan-500 rounded-lg text-white font-medium hover:bg-cyan-600 disabled:opacity-50"
            >
              {loading ? 'Ajustando...' : 'Ajustar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
