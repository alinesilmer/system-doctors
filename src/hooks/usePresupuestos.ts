'use client';

import { useColeccion, useRecurso } from './useRecurso';
import type { Presupuesto } from '@/lib/types';

export function usePresupuestos() {
  const { items, cargando, error, recargar } = useColeccion<Presupuesto>('/api/presupuestos', 'Error al cargar presupuestos');
  return { presupuestos: items, cargando, error, recargar };
}

export function usePresupuesto(id: string) {
  const { dato, cargando, error } = useRecurso<Presupuesto>(id ? `/api/presupuestos/${id}` : null, 'Presupuesto no encontrado');
  return { presupuesto: dato, cargando, error };
}
