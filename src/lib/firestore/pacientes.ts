import {
  collection, doc, getDocs, addDoc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { crearRepositorio, toIso } from './repository';
import type { Paciente, EntradaHistoriaClinica } from '../types';

export const COL_PACIENTES = 'pacientes';
const HC_COL = 'historiaClinica';

export const repositorioPacientes = crearRepositorio<Paciente>(COL_PACIENTES, 'apellido');

export const getPaciente = (id: string) => repositorioPacientes.obtener(id);

// ─── Historia clínica (subcolección de cada paciente) ────────────────────────

const historiaClinica = (pacienteId: string) =>
  collection(doc(getFirebaseDb(), COL_PACIENTES, pacienteId), HC_COL);

export async function getHistoriaClinica(pacienteId: string): Promise<EntradaHistoriaClinica[]> {
  const snap = await getDocs(query(historiaClinica(pacienteId), orderBy('fecha', 'desc')));
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    creadoEn: toIso(d.data().creadoEn),
  } as EntradaHistoriaClinica));
}

export async function crearEntradaHistoriaClinica(
  pacienteId: string,
  datos: Omit<EntradaHistoriaClinica, 'id' | 'creadoEn'>,
): Promise<string> {
  const creado = await addDoc(historiaClinica(pacienteId), {
    ...datos,
    creadoEn: serverTimestamp(),
  });
  return creado.id;
}
