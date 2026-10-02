'use client';

import { useColeccion } from './useRecurso';
import type { ItemStock } from '@/lib/types';

export function useStock() {
  const { items, cargando, error, recargar } = useColeccion<ItemStock>('/api/stock', 'Error al cargar stock');
  return { items, cargando, error, recargar };
}
