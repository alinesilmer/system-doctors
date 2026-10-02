import {
  collection, doc, getDocs, limit, query, orderBy, serverTimestamp, runTransaction,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { crearRepositorio, toIso } from './repository';
import type { ItemStock, MovimientoStock } from '../types';

const ITEMS_COL = 'stock';
const MOV_COL = 'movimientos';

export const repositorioStock = crearRepositorio<ItemStock>(ITEMS_COL, 'nombre');

// ─── Movimientos ─────────────────────────────────────────────────────────────

/** Lanzado cuando una salida supera el stock disponible en el momento de escribir. */
export class StockInsuficienteError extends Error {
  constructor(readonly disponible: number, readonly solicitado: number) {
    super(`Stock insuficiente: hay ${disponible} y se solicitaron ${solicitado}`);
    this.name = 'StockInsuficienteError';
  }
}

export class ItemInexistenteError extends Error {
  constructor(readonly itemId: string) {
    super(`No existe el ítem de stock ${itemId}`);
    this.name = 'ItemInexistenteError';
  }
}

function calcularCantidad(tipo: MovimientoStock['tipo'], actual: number, cantidad: number): number {
  if (tipo === 'entrada') return actual + cantidad;
  if (tipo === 'salida') return actual - cantidad;
  return cantidad;
}

/**
 * Registra el movimiento y ajusta el stock en una única transacción, de modo que
 * dos salidas simultáneas no puedan dejar la cantidad en negativo.
 */
export async function registrarMovimiento(
  itemId: string,
  tipo: MovimientoStock['tipo'],
  cantidad: number,
  motivo?: string,
): Promise<{ cantidadAnterior: number; cantidadNueva: number }> {
  const db = getFirebaseDb();

  return runTransaction(db, async (tx) => {
    const itemRef = doc(db, ITEMS_COL, itemId);
    const snap = await tx.get(itemRef);
    if (!snap.exists()) throw new ItemInexistenteError(itemId);

    const item = snap.data() as ItemStock;
    const cantidadAnterior = item.cantidad ?? 0;
    const cantidadNueva = calcularCantidad(tipo, cantidadAnterior, cantidad);

    if (cantidadNueva < 0) throw new StockInsuficienteError(cantidadAnterior, cantidad);

    tx.set(doc(collection(db, MOV_COL)), {
      itemId,
      itemNombre: item.nombre,
      tipo,
      cantidad,
      cantidadAnterior,
      cantidadNueva,
      motivo: motivo ?? '',
      creadoEn: serverTimestamp(),
    });

    tx.update(itemRef, { cantidad: cantidadNueva, actualizadoEn: serverTimestamp() });

    return { cantidadAnterior, cantidadNueva };
  });
}

/** Últimos movimientos, del más reciente al más antiguo. */
export async function getMovimientos(maximo = 200): Promise<MovimientoStock[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), MOV_COL), orderBy('creadoEn', 'desc'), limit(maximo)),
  );
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    creadoEn: toIso(d.data().creadoEn),
  } as MovimientoStock));
}
