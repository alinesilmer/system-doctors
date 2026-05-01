import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import type { Practica } from '../types';

const COL = 'practicas';

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

export async function getPracticas(): Promise<Practica[]> {
  const snap = await getDocs(query(collection(getFirebaseDb(), COL), orderBy('nombre')));
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, creadoEn: toIso(data.creadoEn), actualizadoEn: toIso(data.actualizadoEn) } as Practica;
  });
}

export async function getPractica(id: string): Promise<Practica | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COL, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...data, id: snap.id, creadoEn: toIso(data.creadoEn), actualizadoEn: toIso(data.actualizadoEn) } as Practica;
}

export async function crearPractica(datos: Omit<Practica, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COL), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function actualizarPractica(id: string, datos: Partial<Practica>): Promise<void> {
  const { id: _id, creadoEn: _c, ...rest } = datos as Practica;
  await updateDoc(doc(getFirebaseDb(), COL, id), { ...rest, actualizadoEn: serverTimestamp() });
}

export async function eliminarPractica(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COL, id));
}
