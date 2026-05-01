import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import type { Tratamiento } from '../types';

const COL = 'tratamientos';

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

export async function getTratamientos(): Promise<Tratamiento[]> {
  const snap = await getDocs(query(collection(getFirebaseDb(), COL), orderBy('nombre')));
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, creadoEn: toIso(data.creadoEn), actualizadoEn: toIso(data.actualizadoEn) } as Tratamiento;
  });
}

export async function getTratamiento(id: string): Promise<Tratamiento | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COL, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...data, id: snap.id, creadoEn: toIso(data.creadoEn), actualizadoEn: toIso(data.actualizadoEn) } as Tratamiento;
}

export async function crearTratamiento(datos: Omit<Tratamiento, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COL), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function actualizarTratamiento(id: string, datos: Partial<Tratamiento>): Promise<void> {
  const { id: _id, creadoEn: _c, ...rest } = datos as Tratamiento;
  await updateDoc(doc(getFirebaseDb(), COL, id), { ...rest, actualizadoEn: serverTimestamp() });
}

export async function eliminarTratamiento(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COL, id));
}
