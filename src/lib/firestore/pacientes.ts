import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import type { Paciente, EntradaHistoriaClinica } from '../types';

const COL = 'pacientes';
const HC_COL = 'historiaClinica';

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

export async function getPacientes(): Promise<Paciente[]> {
  const snap = await getDocs(query(collection(getFirebaseDb(), COL), orderBy('apellido')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      creadoEn: toIso(data.creadoEn),
      actualizadoEn: toIso(data.actualizadoEn),
    } as Paciente;
  });
}

export async function getPaciente(id: string): Promise<Paciente | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COL, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    creadoEn: toIso(data.creadoEn),
    actualizadoEn: toIso(data.actualizadoEn),
  } as Paciente;
}

export async function crearPaciente(datos: Omit<Paciente, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COL), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function actualizarPaciente(id: string, datos: Partial<Paciente>): Promise<void> {
  const { id: _id, creadoEn: _c, ...rest } = datos as Paciente;
  await updateDoc(doc(getFirebaseDb(), COL, id), {
    ...rest,
    actualizadoEn: serverTimestamp(),
  });
}

export async function eliminarPaciente(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COL, id));
}

export async function getHistoriaClinica(pacienteId: string): Promise<EntradaHistoriaClinica[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), COL, pacienteId, HC_COL), orderBy('fecha', 'desc'))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, creadoEn: toIso(data.creadoEn) } as EntradaHistoriaClinica;
  });
}

export async function crearEntradaHistoriaClinica(
  pacienteId: string,
  datos: Omit<EntradaHistoriaClinica, 'id' | 'creadoEn'>
): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COL, pacienteId, HC_COL), {
    ...datos,
    creadoEn: serverTimestamp(),
  });
  return ref.id;
}
