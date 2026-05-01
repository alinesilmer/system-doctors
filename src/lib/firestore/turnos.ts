import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import type { Turno } from '../types';

const COL = 'turnos';

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

export async function getTurnos(desde?: string, hasta?: string): Promise<Turno[]> {
  const base = collection(getFirebaseDb(), COL);
  const q = desde
    ? query(base, where('fecha', '>=', desde), orderBy('fecha'))
    : query(base, orderBy('fecha'));
  const snap = await getDocs(q);
  const turnos = snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      creadoEn: toIso(data.creadoEn),
      actualizadoEn: toIso(data.actualizadoEn),
    } as Turno;
  });
  return turnos.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
}

export async function getTurnosByPaciente(pacienteId: string): Promise<Turno[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), COL), where('pacienteId', '==', pacienteId), orderBy('fecha', 'desc'))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      creadoEn: toIso(data.creadoEn),
      actualizadoEn: toIso(data.actualizadoEn),
    } as Turno;
  });
}

export async function getTurno(id: string): Promise<Turno | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COL, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    creadoEn: toIso(data.creadoEn),
    actualizadoEn: toIso(data.actualizadoEn),
  } as Turno;
}

export async function crearTurno(datos: Omit<Turno, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COL), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function actualizarTurno(id: string, datos: Partial<Turno>): Promise<void> {
  const { id: _id, creadoEn: _c, ...rest } = datos as Turno;
  await updateDoc(doc(getFirebaseDb(), COL, id), {
    ...rest,
    actualizadoEn: serverTimestamp(),
  });
}

export async function eliminarTurno(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COL, id));
}
