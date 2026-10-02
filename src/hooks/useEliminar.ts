'use client';

import { useCallback, useState } from 'react';
import { pedirApi } from '@/lib/api/cliente';

/**
 * Flujo de "eliminar con confirmación" de los listados: guarda qué se pidió
 * borrar, hace el DELETE al confirmar y expone el error para mostrarlo en el
 * diálogo en vez de cerrarlo como si hubiera salido bien.
 */
export function useEliminar<T>(urlDe: (objetivo: T) => string, alEliminar: () => void | Promise<void>) {
  const [objetivo, setObjetivo] = useState<T | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pedir = useCallback((nuevo: T) => {
    setError(null);
    setObjetivo(nuevo);
  }, []);

  const cancelar = useCallback(() => setObjetivo(null), []);

  async function confirmar() {
    if (!objetivo) return;
    setEliminando(true);
    setError(null);
    try {
      await pedirApi(urlDe(objetivo), { metodo: 'DELETE', mensajeError: 'No se pudo eliminar' });
      setObjetivo(null);
      await alEliminar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEliminando(false);
    }
  }

  return { objetivo, pedir, cancelar, confirmar, eliminando, error };
}
