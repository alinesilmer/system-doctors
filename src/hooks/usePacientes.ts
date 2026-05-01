'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Paciente } from '@/lib/types';

export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/pacientes');
      if (!res.ok) throw new Error('Error al cargar pacientes');
      const data = await res.json();
      setPacientes(data.items ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { pacientes, cargando, error, recargar: cargar };
}

export function usePaciente(id: string) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    fetch(`/api/pacientes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Paciente no encontrado');
        return r.json();
      })
      .then((data) => setPaciente(data.data))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [id]);

  return { paciente, cargando, error };
}
