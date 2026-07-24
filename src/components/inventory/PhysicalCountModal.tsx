'use client';

import { useState } from 'react';
import { useInventoryAdjustments } from '@/hooks/useInventoryAdjustments';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <Dialog open={true} onClose={onClose} title="Conteo Físico" showClose>
      <p className="text-body-medium text-abyssal-text-secondary mb-4">
        Ingresa la cantidad física real de cada producto. El sistema calculará la diferencia automáticamente.
      </p>

      <div className="space-y-3 mb-4 max-h-[50vh] overflow-y-auto pr-1">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-4 p-3 bg-abyssal-surface-high/50 rounded-xl border border-abyssal-primary/10">
            <div className="flex-1 min-w-0">
              <p className="text-body-medium text-abyssal-text-primary font-medium truncate">{product.name}</p>
              <p className="text-label-small text-abyssal-text-secondary">Stock actual: {product.stock} {product.unit}</p>
            </div>
            <div className="w-28 shrink-0">
              <Input
                type="number"
                step="0.01"
                placeholder="Cantidad real"
                value={counts[product.id] || ''}
                onChange={(e) => handleCountChange(product.id, e.target.value)}
              />
            </div>
            {counts[product.id] !== undefined && (
              <div className={`text-label-small font-medium shrink-0 ${counts[product.id] >= product.stock ? 'text-abyssal-green' : 'text-abyssal-red'}`}>
                {counts[product.id] >= product.stock ? '+' : ''}{(counts[product.id] - product.stock).toFixed(2)} {product.unit}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-label-medium text-abyssal-text-secondary mb-1">Notas (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-abyssal-surface-high glass-subtle rounded-xl px-4 py-3.5 text-[15px] text-abyssal-text-primary outline-none border border-abyssal-outline focus:border-abyssal-primary/60 focus:ring-4 focus:ring-abyssal-primary/10 transition-all"
          rows={2}
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button type="button" disabled={loading || !hasChanges} onClick={handleSubmit} className="flex-1">
          {loading ? 'Registrando...' : 'Registrar Conteo'}
        </Button>
      </div>
    </Dialog>
  );
}