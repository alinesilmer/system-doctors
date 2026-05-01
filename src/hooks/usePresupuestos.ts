'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Presupuesto } from '@/lib/types';

export function usePresupuestos() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/presupuestos');
      if (!res.ok) throw new Error('Error al cargar presupuestos');
      const data = await res.json();
      setPresupuestos(data.items ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { presupuestos, cargando, error, recargar: cargar };
}

export function usePresupuesto(id: string) {
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    fetch(`/api/presupuestos/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Presupuesto no encontrado');
        return r.json();
      })
      .then((data) => setPresupuesto(data.data))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [id]);

  return { presupuesto, cargando, error };
}
