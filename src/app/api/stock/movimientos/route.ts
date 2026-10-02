import { getMovimientos } from '@/lib/firestore/stock';
import { manejarErrores, ok } from '@/lib/api/respuestas';

export const GET = manejarErrores(async () => {
  return ok({ items: await getMovimientos() });
}, 'Error al obtener movimientos');
