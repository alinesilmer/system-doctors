'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Turno } from '@/lib/types';

export function useTurnos() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/turnos');
      if (!res.ok) throw new Error('Error al cargar turnos');
      const data = await res.json();
      setTurnos(data.items ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { turnos, cargando, error, recargar: cargar };
}
