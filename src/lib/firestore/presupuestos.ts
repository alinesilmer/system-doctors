import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import type { Presupuesto } from '../types';

const COL = 'presupuestos';

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

export async function getPresupuestos(): Promise<Presupuesto[]> {
  const snap = await getDocs(query(collection(getFirebaseDb(), COL), orderBy('creadoEn', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, creadoEn: toIso(data.creadoEn), actualizadoEn: toIso(data.actualizadoEn) } as Presupuesto;
  });
}

export async function getPresupuesto(id: string): Promise<Presupuesto | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COL, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...data, id: snap.id, creadoEn: toIso(data.creadoEn), actualizadoEn: toIso(data.actualizadoEn) } as Presupuesto;
}

export async function crearPresupuesto(datos: Omit<Presupuesto, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COL), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function actualizarPresupuesto(id: string, datos: Partial<Presupuesto>): Promise<void> {
  const { id: _id, creadoEn: _c, ...rest } = datos as Presupuesto;
  await updateDoc(doc(getFirebaseDb(), COL, id), { ...rest, actualizadoEn: serverTimestamp() });
}

export async function eliminarPresupuesto(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COL, id));
}
