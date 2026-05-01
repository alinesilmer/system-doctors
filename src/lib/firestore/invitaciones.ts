import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  query, where, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import type { FormularioInvitacion, Paciente } from '../types';

const COL = 'invitaciones_paciente';

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

export async function crearInvitacion(): Promise<{ id: string; token: string }> {
  const token = crypto.randomUUID();
  const ref = await addDoc(collection(getFirebaseDb(), COL), {
    token,
    estado: 'pendiente',
    creadoEn: serverTimestamp(),
  });
  return { id: ref.id, token };
}

export async function getInvitacionPorToken(token: string): Promise<FormularioInvitacion | null> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), COL), where('token', '==', token))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return { ...data, id: d.id, creadoEn: toIso(data.creadoEn), completadoEn: toIso(data.completadoEn) } as FormularioInvitacion;
}

export async function getInvitaciones(): Promise<FormularioInvitacion[]> {
  const snap = await getDocs(collection(getFirebaseDb(), COL));
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, creadoEn: toIso(data.creadoEn), completadoEn: toIso(data.completadoEn) } as FormularioInvitacion;
  }).sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

export async function completarInvitacion(
  id: string,
  datos: Omit<Paciente, 'id' | 'creadoEn' | 'actualizadoEn'>
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COL, id), {
    estado: 'completado',
    datosPaciente: datos,
    completadoEn: serverTimestamp(),
  });
}

export async function aprobarInvitacion(id: string): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COL, id), { estado: 'aprobado' });
}
