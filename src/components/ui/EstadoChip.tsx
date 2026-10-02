import Etiqueta, { type TonoEtiqueta } from './Etiqueta';
import type { EstadoTurno } from '@/lib/types';

export const ESTADOS_TURNO: Record<EstadoTurno, { label: string; tono: TonoEtiqueta }> = {
  pendiente:  { label: 'Pendiente',  tono: 'sun' },
  confirmado: { label: 'Confirmado', tono: 'ok' },
  cancelado:  { label: 'Cancelado',  tono: 'mal' },
  completado: { label: 'Hecho',      tono: 'neutro' },
  no_asistio: { label: 'No vino',    tono: 'lila' },
};

export default function EstadoChip({ estado }: { estado: EstadoTurno }) {
  const { label, tono } = ESTADOS_TURNO[estado] ?? ESTADOS_TURNO.pendiente;
  return <Etiqueta tono={tono}>{label}</Etiqueta>;
}
