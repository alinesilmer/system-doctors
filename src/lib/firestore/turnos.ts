import {
  collection, doc, getDocs, query, orderBy, updateDoc, where, type QueryConstraint,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { crearRepositorio, hidratar } from './repository';
import type { Turno } from '../types';

const COL = 'turnos';

export const repositorioTurnos = crearRepositorio<Turno>(COL, 'fecha');

/** Turnos dentro de un rango de fechas (`YYYY-MM-DD`), ambos extremos inclusive. */
export async function getTurnos(desde?: string, hasta?: string): Promise<Turno[]> {
  const restricciones: QueryConstraint[] = [];
  if (desde) restricciones.push(where('fecha', '>=', desde));
  if (hasta) restricciones.push(where('fecha', '<=', hasta));
  restricciones.push(orderBy('fecha'));

  const snap = await getDocs(query(collection(getFirebaseDb(), COL), ...restricciones));
  return snap.docs
    .map((d) => hidratar<Turno>(d.id, d.data()))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horaInicio.localeCompare(b.horaInicio));
}

/**
 * Deja asentado para qué fecha se avisó el turno, así un segundo envío de
 * recordatorios no le escribe dos veces al mismo paciente. Si el turno se
 * reprograma, la fecha deja de coincidir y vuelve a ser recordable.
 */
export async function marcarRecordatorioEnviado(turno: Turno): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COL, turno.id), { recordatorioPara: turno.fecha });
}
