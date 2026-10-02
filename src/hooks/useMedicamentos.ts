'use client';

import { useMemo } from 'react';
import { useColeccion } from './useRecurso';
import type { Medicamento, FormaFarmaceutica } from '@/lib/types';

export function useMedicamentos() {
  const { items, cargando, error, recargar } = useColeccion<Medicamento>('/api/medicamentos', 'Error al cargar medicamentos');
  return { medicamentos: items, cargando, error, recargar };
}

export function useBusquedaMedicamentos(
  medicamentos: Medicamento[],
  query: string,
  forma: FormaFarmaceutica | 'todas',
  receta: 'todas' | 'con' | 'sin',
) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    return medicamentos.filter((m) => {
      const coincideTexto =
        !q ||
        m.nombre.toLowerCase().includes(q) ||
        m.principioActivo.toLowerCase().includes(q) ||
        m.laboratorio?.toLowerCase().includes(q) ||
        m.categoria?.toLowerCase().includes(q) ||
        m.presentacion.toLowerCase().includes(q);

      const coincideForma = forma === 'todas' || m.forma === forma;

      const coincideReceta =
        receta === 'todas' ||
        (receta === 'con' && m.requiereReceta) ||
        (receta === 'sin' && !m.requiereReceta);

      return coincideTexto && coincideForma && coincideReceta;
    });
  }, [medicamentos, query, forma, receta]);
}
