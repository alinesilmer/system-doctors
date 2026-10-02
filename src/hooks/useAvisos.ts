'use client';

import { useEffect, useState } from 'react';
import { pedirApi } from '@/lib/api/cliente';
import type { ConversacionWA, ItemStock } from '@/lib/types';

export interface Avisos {
  /** Mensajes de WhatsApp sin leer. */
  mensajes: number;
  /** Insumos en el mínimo o por debajo. */
  stock: number;
}

const CADA_MS = 2 * 60 * 1000;
const SIN_AVISOS: Avisos = { mensajes: 0, stock: 0 };

async function contar(): Promise<Avisos> {
  const [conversaciones, stock] = await Promise.all([
    pedirApi<{ items: ConversacionWA[] }>('/api/whatsapp/conversaciones'),
    pedirApi<{ items: ItemStock[] }>('/api/stock'),
  ]);
  return {
    mensajes: conversaciones.items.reduce((total, c) => total + (c.noLeidos ?? 0), 0),
    stock: stock.items.filter((i) => i.cantidad <= i.cantidadMinima).length,
  };
}

/** Números que el dock muestra sobre "Mensajes" y "Stock". Se refrescan solos. */
export function useAvisos(): Avisos {
  const [avisos, setAvisos] = useState<Avisos>(SIN_AVISOS);

  useEffect(() => {
    let vigente = true;
    const actualizar = () => {
      // Con la pestaña en segundo plano no gastamos lecturas.
      if (document.visibilityState !== 'visible') return;
      contar()
        .then((nuevos) => { if (vigente) setAvisos(nuevos); })
        .catch(() => { /* un aviso que no carga no debe romper la navegación */ });
    };

    actualizar();
    const intervalo = setInterval(actualizar, CADA_MS);
    document.addEventListener('visibilitychange', actualizar);
    return () => {
      vigente = false;
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', actualizar);
    };
  }, []);

  return avisos;
}
