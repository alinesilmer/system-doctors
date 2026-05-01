'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Practica } from '@/lib/types';

export function usePracticas() {
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/practicas');
      if (!res.ok) throw new Error('Error al cargar prácticas');
      const data = await res.json();
      setPracticas(data.items ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { practicas, cargando, error, recargar: cargar };
}
