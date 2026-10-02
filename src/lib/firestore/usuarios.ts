import {
  collection, doc, getDoc, getDocs, setDoc, query, orderBy,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { toIsoOpcional } from './repository';

export type RolUsuario = 'super_admin' | 'admin' | 'medico' | 'secretaria';

export interface UsuarioPerfil {
  uid: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  cuentaId: string;
  cuentaNombre?: string;
  activo: boolean;
  creadoEn: string;
  ultimoAcceso?: string;
}

const COL = 'usuarios';


export async function getUsuario(uid: string): Promise<UsuarioPerfil | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COL, uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { ...d, uid: snap.id, creadoEn: toIsoOpcional(d.creadoEn), ultimoAcceso: toIsoOpcional(d.ultimoAcceso) } as UsuarioPerfil;
}

export async function getUsuarios(): Promise<UsuarioPerfil[]> {
  const snap = await getDocs(query(collection(getFirebaseDb(), COL), orderBy('creadoEn', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, uid: d.id, creadoEn: toIsoOpcional(data.creadoEn), ultimoAcceso: toIsoOpcional(data.ultimoAcceso) } as UsuarioPerfil;
  });
}

export async function crearOActualizarUsuario(uid: string, datos: Partial<UsuarioPerfil>): Promise<void> {
  await setDoc(doc(getFirebaseDb(), COL, uid), { ...datos, uid }, { merge: true });
}

export async function registrarUltimoAcceso(uid: string): Promise<void> {
  await setDoc(doc(getFirebaseDb(), COL, uid), { ultimoAcceso: new Date().toISOString() }, { merge: true });
}
