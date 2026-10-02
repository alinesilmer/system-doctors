'use client';

import { useColeccion, useRecurso } from './useRecurso';
import type { Documento } from '@/lib/types';

export function useDocumentos() {
  const { items, cargando, error, recargar } = useColeccion<Documento>('/api/documentos', 'Error al cargar documentos');
  return { documentos: items, cargando, error, recargar };
}

export function useDocumento(id: string) {
  const { dato, cargando, error } = useRecurso<Documento>(id ? `/api/documentos/${id}` : null, 'Documento no encontrado');
  return { documento: dato, cargando, error };
}
