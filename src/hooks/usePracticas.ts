'use client';

import { useColeccion } from './useRecurso';
import type { Practica } from '@/lib/types';

export function usePracticas() {
  const { items, cargando, error, recargar } = useColeccion<Practica>('/api/practicas', 'Error al cargar prácticas');
  return { practicas: items, cargando, error, recargar };
}
