'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { PriceHistory, PriceAlert } from '@/lib/types';

export function usePurchasePrices(productId: number) {
  const [history, setHistory] = useState<PriceHistory | null>(null);
  const [alert, setAlert] = useState<PriceAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    try {
      const [historyRes, alertRes] = await Promise.all([
        api.get(`/purchase-prices/${productId}`),
        api.get(`/purchase-prices/${productId}/alert`),
      ]);
      setHistory(historyRes.data);
      setAlert(alertRes.data);
    } catch (error) {
      console.error('Error fetching price history:', error);
    } finally {
      setLoading(false);
    }
  };

  return { history, alert, loading, refetch: fetchData };
}
