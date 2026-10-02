'use client';

import { useSyncExternalStore } from 'react';
import { horaActual } from '@/lib/fechas';

// Un único reloj para toda la página: avisa a quien escuche una vez por minuto.
function suscribir(avisar: () => void) {
  const intervalo = setInterval(avisar, 30_000);
  return () => clearInterval(intervalo);
}

/**
 * Hora del consultorio (`HH:MM`), que se actualiza sola. Lo que depende de la
 * hora —qué turno sigue, cuáles ya pasaron— no queda congelado en el momento
 * en que se cargó la pantalla.
 */
export function useAhora(): string {
  return useSyncExternalStore(suscribir, horaActual, () => '00:00');
}
