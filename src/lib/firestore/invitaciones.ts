import {
  collection, doc, getDocs, addDoc, limit,
  query, where, runTransaction, serverTimestamp, type DocumentData,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { COL_PACIENTES } from './pacientes';
import { toIso, type DatosNuevos } from './repository';
import type { FormularioInvitacion, Paciente } from '../types';

const COL = 'invitaciones_paciente';

/** Un enlace sin usar deja de aceptar datos pasado este plazo. */
const VIGENCIA_MS = 7 * 24 * 60 * 60 * 1000;

function hidratar(id: string, data: DocumentData): FormularioInvitacion {
  return {
    ...data,
    id,
    creadoEn: toIso(data.creadoEn),
    // Sin esto, una invitación pendiente figuraría como completada "ahora".
    completadoEn: data.completadoEn ? toIso(data.completadoEn) : undefined,
  } as FormularioInvitacion;
}

export function estaVencida(inv: FormularioInvitacion): boolean {
  return inv.estado === 'pendiente' && Date.now() - new Date(inv.creadoEn).getTime() > VIGENCIA_MS;
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
    query(collection(getFirebaseDb(), COL), where('token', '==', token), limit(1))
  );
  if (snap.empty) return null;
  return hidratar(snap.docs[0].id, snap.docs[0].data());
}

export async function getInvitaciones(): Promise<FormularioInvitacion[]> {
  const snap = await getDocs(collection(getFirebaseDb(), COL));
  return snap.docs
    .map((d) => hidratar(d.id, d.data()))
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

/**
 * Guarda los datos que cargó el paciente. Devuelve `false` si la invitación ya
 * no estaba pendiente: la comprobación va en la misma transacción que la
 * escritura para que dos envíos simultáneos no se pisen.
 */
export async function completarInvitacion(id: string, datos: DatosNuevos<Paciente>): Promise<boolean> {
  const db = getFirebaseDb();
  return runTransaction(db, async (tx) => {
    const ref = doc(db, COL, id);
    const snap = await tx.get(ref);
    if (snap.data()?.estado !== 'pendiente') return false;

    tx.update(ref, { estado: 'completado', datosPaciente: datos, completadoEn: serverTimestamp() });
    return true;
  });
}

/**
 * Crea el paciente y marca la invitación como aprobada de forma atómica, de modo
 * que aprobar dos veces (doble clic, dos pestañas) no duplique al paciente.
 * Devuelve el id del paciente, o `null` si la invitación no estaba para aprobar.
 */
export async function aprobarInvitacion(id: string, datos: DatosNuevos<Paciente>): Promise<string | null> {
  const db = getFirebaseDb();
  return runTransaction(db, async (tx) => {
    const ref = doc(db, COL, id);
    const snap = await tx.get(ref);
    if (snap.data()?.estado !== 'completado') return null;

    const paciente = doc(collection(db, COL_PACIENTES));
    tx.set(paciente, { ...datos, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });
    tx.update(ref, { estado: 'aprobado', pacienteId: paciente.id });
    return paciente.id;
  });
}
