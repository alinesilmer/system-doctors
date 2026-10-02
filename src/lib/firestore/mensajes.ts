import {
  collection, doc, getDocs, addDoc, updateDoc, setDoc,
  query, orderBy, limit, serverTimestamp, increment,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { toIso } from './repository';
import type { MensajeWA, ConversacionWA, PrioridadMensaje } from '../types';

const CONV = 'conversaciones_wa';


function prioridadDesdeUrgencia(urgencia?: string): PrioridadMensaje {
  if (urgencia === 'alta') return 'urgente';
  if (urgencia === 'media') return 'normal';
  return 'baja';
}

export async function guardarMensajeEntrante(params: {
  telefono: string;
  nombre?: string;
  cuerpo: string;
  clasificacion?: string;
  urgencia?: string;
  derivarA?: string;
  respuestaSugerida?: string;
  respuestaAutomatica?: string;
  resumen?: string;
}): Promise<string> {
  const db = getFirebaseDb();
  const convRef = doc(db, CONV, params.telefono);
  const mensajesRef = collection(db, CONV, params.telefono, 'mensajes');

  const prioridad = prioridadDesdeUrgencia(params.urgencia);

  await setDoc(convRef, {
    telefono: params.telefono,
    nombre: params.nombre ?? params.telefono,
    ultimoMensaje: params.cuerpo.slice(0, 80),
    ultimaActividad: serverTimestamp(),
    prioridad,
    estado: 'activo',
    noLeidos: increment(1),
    creadoEn: serverTimestamp(),
  }, { merge: true });

  const campos: Record<string, unknown> = {
    telefono: params.telefono,
    cuerpo: params.cuerpo,
    direccion: 'entrante',
    respondido: false,
    creadoEn: serverTimestamp(),
  };
  if (params.nombre) campos.nombre = params.nombre;
  if (params.clasificacion) campos.clasificacion = params.clasificacion;
  if (params.urgencia) campos.urgencia = params.urgencia;
  if (params.derivarA) campos.derivarA = params.derivarA;
  if (params.respuestaSugerida) campos.respuestaSugerida = params.respuestaSugerida;
  if (params.respuestaAutomatica) campos.respuestaAutomatica = params.respuestaAutomatica;
  if (params.resumen) campos.resumen = params.resumen;

  const ref = await addDoc(mensajesRef, campos);

  return ref.id;
}

export async function guardarMensajeSaliente(telefono: string, cuerpo: string): Promise<void> {
  const db = getFirebaseDb();
  await addDoc(collection(db, CONV, telefono, 'mensajes'), {
    telefono,
    cuerpo,
    direccion: 'saliente',
    respondido: true,
    creadoEn: serverTimestamp(),
  });
  await setDoc(doc(db, CONV, telefono), {
    // Si el hilo lo abrimos nosotros (un recordatorio), el documento nace acá.
    telefono,
    ultimoMensaje: `✓ ${cuerpo.slice(0, 60)}`,
    ultimaActividad: serverTimestamp(),
  }, { merge: true });
}

/** Sólo actualiza conversaciones existentes: leer un teléfono desconocido no crea un hilo vacío. */
export async function marcarLeidos(telefono: string): Promise<void> {
  try {
    await updateDoc(doc(getFirebaseDb(), CONV, telefono), { noLeidos: 0 });
  } catch (e) {
    if ((e as { code?: string }).code !== 'not-found') throw e;
  }
}

/** Destaca la conversación en la bandeja para que la atienda una persona. */
export async function marcarUrgente(telefono: string): Promise<void> {
  await setDoc(doc(getFirebaseDb(), CONV, telefono), {
    telefono,
    prioridad: 'urgente',
    requiereAtencion: true,
    ultimaAlerta: serverTimestamp(),
  }, { merge: true });
}

export async function getConversaciones(): Promise<ConversacionWA[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), CONV), orderBy('ultimaActividad', 'desc'))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      // Un hilo abierto por un mensaje saliente no trae todos los campos.
      telefono: d.id,
      ultimoMensaje: '',
      noLeidos: 0,
      prioridad: 'baja',
      estado: 'activo',
      ...data,
      id: d.id,
      ultimaActividad: toIso(data.ultimaActividad),
      creadoEn: toIso(data.creadoEn),
    } as ConversacionWA;
  });
}

export async function getMensajes(telefono: string): Promise<MensajeWA[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), CONV, telefono, 'mensajes'),
      orderBy('creadoEn', 'asc'),
      limit(100)
    )
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, creadoEn: toIso(data.creadoEn) } as MensajeWA;
  });
}

export async function marcarRespondido(telefono: string, mensajeId: string): Promise<void> {
  await updateDoc(
    doc(getFirebaseDb(), CONV, telefono, 'mensajes', mensajeId),
    { respondido: true }
  );
}
