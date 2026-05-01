'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ItemStock } from '@/lib/types';

export function useStock() {
  const [items, setItems] = useState<ItemStock[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/stock');
      if (!res.ok) throw new Error('Error al cargar stock');
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { items, cargando, error, recargar: cargar };
}
