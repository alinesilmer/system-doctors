'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Documento } from '@/lib/types';

export function useDocumentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/documentos');
      if (!res.ok) throw new Error('Error al cargar documentos');
      const data = await res.json();
      setDocumentos(data.items ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { documentos, cargando, error, recargar: cargar };
}

export function useDocumento(id: string) {
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    fetch(`/api/documentos/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Documento no encontrado');
        return r.json();
      })
      .then((data) => setDocumento(data.data))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [id]);

  return { documento, cargando, error };
}
