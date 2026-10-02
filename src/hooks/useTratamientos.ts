'use client';

import { useColeccion, useRecurso } from './useRecurso';
import type { Tratamiento } from '@/lib/types';

export function useTratamientos() {
  const { items, cargando, error, recargar } = useColeccion<Tratamiento>('/api/tratamientos', 'Error al cargar tratamientos');
  return { tratamientos: items, cargando, error, recargar };
}

export function useTratamiento(id: string) {
  const { dato, cargando, error } = useRecurso<Tratamiento>(id ? `/api/tratamientos/${id}` : null, 'Tratamiento no encontrado');
  return { tratamiento: dato, cargando, error };
}
