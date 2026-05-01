import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import type { Documento } from '../types';

const COL = 'documentos';

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

export async function getDocumentos(): Promise<Documento[]> {
  const snap = await getDocs(query(collection(getFirebaseDb(), COL), orderBy('titulo')));
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, creadoEn: toIso(data.creadoEn), actualizadoEn: toIso(data.actualizadoEn) } as Documento;
  });
}

export async function getDocumento(id: string): Promise<Documento | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COL, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...data, id: snap.id, creadoEn: toIso(data.creadoEn), actualizadoEn: toIso(data.actualizadoEn) } as Documento;
}

export async function crearDocumento(datos: Omit<Documento, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COL), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function actualizarDocumento(id: string, datos: Partial<Documento>): Promise<void> {
  const { id: _id, creadoEn: _c, ...rest } = datos as Documento;
  await updateDoc(doc(getFirebaseDb(), COL, id), { ...rest, actualizadoEn: serverTimestamp() });
}

export async function eliminarDocumento(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COL, id));
}
