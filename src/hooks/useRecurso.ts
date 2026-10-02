'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { leerCache, pedirApi } from '@/lib/api/cliente';

export interface Coleccion<T> {
  items: T[];
  /** Sólo en la primera carga de cada URL; una recarga deja los datos a la vista. */
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

export interface Recurso<T> {
  dato: T | null;
  cargando: boolean;
  error: string | null;
}

/** Resultado de la última petición, junto a la URL a la que corresponde. */
type Respuesta = { items?: unknown; data?: unknown };

interface Estado<D> {
  para: string | null;
  datos: D;
  error: string | null;
}

const pedirJson = (url: string, mensajeError: string) =>
  pedirApi<{ items?: unknown; data?: unknown }>(url, { mensajeError });

/**
 * Lista un recurso de la API. El estado guarda a qué URL pertenece: al cambiar
 * de URL (otra semana, otro filtro) los datos anteriores dejan de mostrarse y
 * vuelve el estado de carga, sin efectos que reinicien estado a mano. También
 * ignora la respuesta de cualquier petición que haya quedado obsoleta.
 */
export function useColeccion<T>(url: string, mensajeError: string): Coleccion<T> {
  const [estado, setEstado] = useState<Estado<T[]>>({ para: null, datos: [], error: null });
  const peticion = useRef(0);

  const traer = useCallback(() => {
    const actual = ++peticion.current;
    const vigente = () => actual === peticion.current;

    return pedirJson(url, mensajeError)
      .then((json) => {
        if (vigente()) setEstado({ para: url, datos: (json.items as T[]) ?? [], error: null });
      })
      .catch((e: Error) => {
        // Si falla una recarga, lo que ya estaba cargado sigue a la vista.
        if (vigente()) setEstado((previo) => ({ para: url, datos: previo.para === url ? previo.datos : [], error: e.message }));
      });
  }, [url, mensajeError]);

  useEffect(() => {
    const invalidar = peticion;
    void traer();
    // Invalida la respuesta en vuelo al desmontar o cambiar de URL.
    return () => { invalidar.current++; };
  }, [traer]);

  const alDia = estado.para === url;
  // Mientras llega la respuesta nueva, lo último que se vio de esta URL.
  const guardado = alDia ? undefined : leerCache<Respuesta>(url)?.items as T[] | undefined;

  return {
    items: alDia ? estado.datos : guardado ?? [],
    cargando: !alDia && !guardado,
    error: alDia ? estado.error : null,
    recargar: traer,
  };
}

/** Trae un único recurso por URL. Con `url` en null no dispara ninguna petición. */
export function useRecurso<T>(url: string | null, mensajeError: string): Recurso<T> {
  const [estado, setEstado] = useState<Estado<T | null>>({ para: null, datos: null, error: null });

  useEffect(() => {
    if (!url) return;
    let vigente = true;

    pedirJson(url, mensajeError)
      .then((json) => {
        if (vigente) setEstado({ para: url, datos: (json.data as T) ?? null, error: null });
      })
      .catch((e: Error) => {
        if (vigente) setEstado({ para: url, datos: null, error: e.message });
      });

    return () => { vigente = false; };
  }, [url, mensajeError]);

  const alDia = estado.para === url;
  const guardado = !alDia && url ? leerCache<Respuesta>(url)?.data as T | undefined : undefined;

  return {
    dato: alDia ? estado.datos : guardado ?? null,
    cargando: url !== null && !alDia && !guardado,
    error: alDia ? estado.error : null,
  };
}
