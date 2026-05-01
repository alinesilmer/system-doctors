import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import type { ItemStock, MovimientoStock } from '../types';

const ITEMS_COL = 'stock';
const MOV_COL = 'movimientos';

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

export async function getStock(): Promise<ItemStock[]> {
  const snap = await getDocs(query(collection(getFirebaseDb(), ITEMS_COL), orderBy('nombre')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      creadoEn: toIso(data.creadoEn),
      actualizadoEn: toIso(data.actualizadoEn),
    } as ItemStock;
  });
}

export async function getItemStock(id: string): Promise<ItemStock | null> {
  const snap = await getDoc(doc(getFirebaseDb(), ITEMS_COL, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    creadoEn: toIso(data.creadoEn),
    actualizadoEn: toIso(data.actualizadoEn),
  } as ItemStock;
}

export async function crearItemStock(datos: Omit<ItemStock, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), ITEMS_COL), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function actualizarItemStock(id: string, datos: Partial<ItemStock>): Promise<void> {
  const { id: _id, creadoEn: _c, ...rest } = datos as ItemStock;
  await updateDoc(doc(getFirebaseDb(), ITEMS_COL, id), {
    ...rest,
    actualizadoEn: serverTimestamp(),
  });
}

export async function eliminarItemStock(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), ITEMS_COL, id));
}

export async function registrarMovimiento(
  item: ItemStock,
  tipo: MovimientoStock['tipo'],
  cantidad: number,
  motivo?: string
): Promise<void> {
  const cantidadAnterior = item.cantidad;
  const cantidadNueva =
    tipo === 'entrada' ? cantidadAnterior + cantidad :
    tipo === 'salida' ? cantidadAnterior - cantidad :
    cantidad;

  await addDoc(collection(getFirebaseDb(), MOV_COL), {
    itemId: item.id,
    itemNombre: item.nombre,
    tipo,
    cantidad,
    cantidadAnterior,
    cantidadNueva,
    motivo: motivo ?? '',
    creadoEn: serverTimestamp(),
  });

  await updateDoc(doc(getFirebaseDb(), ITEMS_COL, item.id), {
    cantidad: cantidadNueva,
    actualizadoEn: serverTimestamp(),
  });
}

export async function getMovimientos(): Promise<MovimientoStock[]> {
  const snap = await getDocs(query(collection(getFirebaseDb(), MOV_COL), orderBy('creadoEn', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, creadoEn: toIso(data.creadoEn) } as MovimientoStock;
  });
}
