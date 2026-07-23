'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useLowStock } from '@/hooks/useLowStock';
import Link from 'next/link';

export default function LowStockBadge() {
  const { products, count, loading } = useLowStock();
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading || count === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell size={18} />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
          {count}
        </span>
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-[#0a1628] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <p className="text-sm font-medium text-white">Stock Bajo</p>
              <p className="text-xs text-gray-400">{count} producto{count !== 1 ? 's' : ''} por debajo del umbral</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  <div>
                    <p className="text-sm text-white">{product.name}</p>
                    <p className="text-xs text-gray-400">Umbral: {product.low_stock_threshold} {product.unit}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-400">
                    {product.stock} {product.unit}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/products"
              onClick={() => setShowDropdown(false)}
              className="block p-3 text-center text-sm text-cyan-400 hover:bg-white/5 transition-colors"
            >
              Ver todos los productos
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
