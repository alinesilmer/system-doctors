'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Tratamiento } from '@/lib/types';

export function useTratamientos() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/tratamientos');
      if (!res.ok) throw new Error('Error al cargar tratamientos');
      const data = await res.json();
      setTratamientos(data.items ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { tratamientos, cargando, error, recargar: cargar };
}

export function useTratamiento(id: string) {
  const [tratamiento, setTratamiento] = useState<Tratamiento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    fetch(`/api/tratamientos/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Tratamiento no encontrado');
        return r.json();
      })
      .then((data) => setTratamiento(data.data))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [id]);

  return { tratamiento, cargando, error };
}
