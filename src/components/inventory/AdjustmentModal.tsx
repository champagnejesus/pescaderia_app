'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useInventoryAdjustments } from '@/hooks/useInventoryAdjustments';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';

interface AdjustmentModalProps {
  productId: number;
  productName: string;
  currentStock: number;
  unit: string;
  onClose: () => void;
  onAdjustment: () => void;
}

export default function AdjustmentModal({ productId, productName, currentStock, unit, onClose, onAdjustment }: AdjustmentModalProps) {
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
    <Dialog open={true} onClose={onClose} title="Ajustar Stock" showClose>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-abyssal-surface-high/50 rounded-xl border border-abyssal-primary/10">
          <p className="text-body-medium text-abyssal-text-primary font-medium">{productName}</p>
          <p className="text-headline-medium text-abyssal-primary font-bold mt-1">{currentStock} {unit}</p>
        </div>

        <div>
          <label className="block text-label-medium text-abyssal-text-secondary mb-1">Cantidad (+ para agregar, - para restar)</label>
          <Input
            type="number"
            step="0.01"
            value={quantityChange}
            onChange={(e) => setQuantityChange(parseFloat(e.target.value) || 0)}
            required
          />
          <p className="text-label-small text-abyssal-text-secondary mt-1">
            Stock resultante: {currentStock + quantityChange} {unit}
          </p>
        </div>

        <div>
          <label className="block text-label-medium text-abyssal-text-secondary mb-1">Razón</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-abyssal-surface-high glass-subtle rounded-xl px-4 py-3.5 text-[15px] text-abyssal-text-primary outline-none border border-abyssal-outline focus:border-abyssal-primary/60 focus:ring-4 focus:ring-abyssal-primary/10 transition-all appearance-none"
          >
            {reasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-label-medium text-abyssal-text-secondary mb-1">Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-abyssal-surface-high glass-subtle rounded-xl px-4 py-3.5 text-[15px] text-abyssal-text-primary outline-none border border-abyssal-outline focus:border-abyssal-primary/60 focus:ring-4 focus:ring-abyssal-primary/10 transition-all"
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading || quantityChange === 0} className="flex-1">
            {loading ? 'Ajustando...' : 'Ajustar'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}