'use client';

import { useMemo } from 'react';
import { useColeccion, useRecurso } from './useRecurso';
import { useAhora } from './useAhora';
import { useStock } from './useStock';
import { diasDeLaSemana, hoyIso } from '@/lib/fechas';
import type { ItemStock, Turno } from '@/lib/types';

export interface DiaDeSemana {
  fecha: string;
  etiqueta: string;
  cantidad: number;
  esHoy: boolean;
}

/** Todo lo que muestra la pantalla de inicio, ya calculado. */
export interface ResumenInicio {
  cargando: boolean;
  error: string | null;
  pacientes: number;
  itemsStock: number;
  turnosHoy: Turno[];
  turnosSemana: number;
  /** Primer turno de hoy que todavía no empezó. */
  proximo: Turno | null;
  stockBajo: ItemStock[];
  semana: DiaDeSemana[];
}

const ETIQUETAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface Datos {
  hoy: string;
  ahora: string;
  pacientes: number;
  turnos: Turno[];
  stock: ItemStock[];
  cargando: boolean;
  error?: string | null;
}

/** Función pura: la misma arma el resumen real y el de ejemplo. */
export function armarResumen({ hoy, ahora, pacientes, turnos, stock, cargando, error = null }: Datos): ResumenInicio {
  const vigentes = turnos.filter((t) => t.estado !== 'cancelado');
  const turnosHoy = vigentes
    .filter((t) => t.fecha === hoy)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  return {
    cargando,
    error,
    pacientes,
    itemsStock: stock.length,
    turnosHoy,
    turnosSemana: vigentes.length,
    proximo: turnosHoy.find((t) => t.horaInicio >= ahora && t.estado !== 'completado') ?? null,
    stockBajo: stock.filter((i) => i.cantidad <= i.cantidadMinima),
    semana: diasDeLaSemana(hoy).map((fecha, i) => ({
      fecha,
      etiqueta: ETIQUETAS[i],
      cantidad: vigentes.filter((t) => t.fecha === fecha).length,
      esHoy: fecha === hoy,
    })),
  };
}

export function useResumenInicio(): ResumenInicio {
  const hoy = hoyIso();
  const [lunes, , , , , , domingo] = useMemo(() => diasDeLaSemana(hoy), [hoy]);

  // Sólo la semana en curso: el inicio no necesita el historial completo de turnos.
  const turnos = useColeccion<Turno>(`/api/turnos?desde=${lunes}&hasta=${domingo}`, 'Error al cargar turnos');
  // Del padrón sólo hace falta el número, no las fichas.
  const pacientes = useRecurso<{ cantidad: number }>('/api/pacientes/cantidad', 'Error al contar pacientes');
  const ahora = useAhora();
  const { items: stock, cargando: cargandoStock, error: errorStock } = useStock();

  const cargando = turnos.cargando || pacientes.cargando || cargandoStock;
  const error = turnos.error ?? pacientes.error ?? errorStock;

  return useMemo(
    () => armarResumen({
      hoy, ahora, pacientes: pacientes.dato?.cantidad ?? 0, turnos: turnos.items, stock, cargando, error,
    }),
    [hoy, ahora, pacientes.dato, turnos.items, stock, cargando, error],
  );
}
