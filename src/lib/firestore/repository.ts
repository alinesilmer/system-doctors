import {
  addDoc, collection, deleteDoc, doc, getCountFromServer, getDoc, getDocs, orderBy, query,
  serverTimestamp, Timestamp, updateDoc,
  type DocumentData, type OrderByDirection,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { sinCamposDeAuditoria, type DatosNuevos, type EntidadBase } from '../entidad';

export type { DatosNuevos, EntidadBase };

/** Normaliza un Timestamp de Firestore (o lo que haya quedado guardado) a ISO. */
export function toIso(ts: unknown): string {
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

/** Igual que `toIso`, pero deja el campo vacío cuando no hay fecha guardada. */
export function toIsoOpcional(ts: unknown): string {
  if (!ts) return '';
  return toIso(ts);
}

/** Arma la entidad de dominio a partir del documento crudo de Firestore. */
export function hidratar<T extends EntidadBase>(id: string, data: DocumentData): T {
  return {
    ...data,
    id,
    creadoEn: toIso(data.creadoEn),
    actualizadoEn: toIso(data.actualizadoEn),
  } as T;
}

export interface Repositorio<T extends EntidadBase> {
  listar(): Promise<T[]>;
  /** Cantidad de documentos, sin descargarlos. */
  contar(): Promise<number>;
  obtener(id: string): Promise<T | null>;
  crear(datos: DatosNuevos<T>): Promise<string>;
  actualizar(id: string, datos: Partial<T>): Promise<void>;
  eliminar(id: string): Promise<void>;
}

/**
 * CRUD estándar sobre una colección de Firestore. Las colecciones que necesitan
 * consultas propias (turnos, stock, pacientes) componen sobre estos helpers en
 * lugar de usar el repositorio genérico.
 */
export function crearRepositorio<T extends EntidadBase>(
  nombreColeccion: string,
  ordenarPor: string,
  direccion: OrderByDirection = 'asc',
): Repositorio<T> {
  const coleccion = () => collection(getFirebaseDb(), nombreColeccion);
  const documento = (id: string) => doc(getFirebaseDb(), nombreColeccion, id);

  return {
    async listar() {
      const snap = await getDocs(query(coleccion(), orderBy(ordenarPor, direccion)));
      return snap.docs.map((d) => hidratar<T>(d.id, d.data()));
    },

    async contar() {
      return (await getCountFromServer(coleccion())).data().count;
    },

    async obtener(id) {
      const snap = await getDoc(documento(id));
      return snap.exists() ? hidratar<T>(snap.id, snap.data()) : null;
    },

    async crear(datos) {
      const creado = await addDoc(coleccion(), {
        ...datos,
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      });
      return creado.id;
    },

    async actualizar(id, datos) {
      await updateDoc(documento(id), {
        ...sinCamposDeAuditoria(datos),
        actualizadoEn: serverTimestamp(),
      });
    },

    async eliminar(id) {
      await deleteDoc(documento(id));
    },
  };
}
