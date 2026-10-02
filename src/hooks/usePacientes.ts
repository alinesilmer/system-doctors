'use client';

import { useColeccion, useRecurso } from './useRecurso';
import type { Paciente } from '@/lib/types';

export function usePacientes() {
  const { items, cargando, error, recargar } = useColeccion<Paciente>('/api/pacientes', 'Error al cargar pacientes');
  return { pacientes: items, cargando, error, recargar };
}

export function usePaciente(id: string) {
  const { dato, cargando, error } = useRecurso<Paciente>(id ? `/api/pacientes/${id}` : null, 'Paciente no encontrado');
  return { paciente: dato, cargando, error };
}
