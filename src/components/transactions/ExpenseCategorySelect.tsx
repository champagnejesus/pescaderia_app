'use client';

import { useState } from 'react';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { ExpenseCategory } from '@/lib/types';

interface ExpenseCategorySelectProps {
  value: number | null;
  onChange: (categoryId: number | null) => void;
}

export default function ExpenseCategorySelect({ value, onChange }: ExpenseCategorySelectProps) {
  const { categories, loading } = useExpenseCategories();
  const [selectedParent, setSelectedParent] = useState<number | null>(null);

  const parentCategories = categories.filter((c) => !c.parent_id);
  const subcategories = categories.find((c) => c.id === selectedParent)?.subcategories || [];

  const handleParentChange = (parentId: number | null) => {
    setSelectedParent(parentId);
    onChange(null);
  };

  if (loading) {
    return <div className="text-gray-400 text-sm">Cargando categorías...</div>;
  }

  return (
    <div className="flex gap-2">
      <select
        value={selectedParent || ''}
        onChange={(e) => handleParentChange(e.target.value ? Number(e.target.value) : null)}
        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
      >
        <option value="">Categoría</option>
        {parentCategories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {subcategories.length > 0 && (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="">Subcategoría</option>
          {subcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
