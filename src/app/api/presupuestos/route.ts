import { rutasDeColeccion } from '@/lib/api/crud';
import { presupuestos } from '@/lib/recursos';

export const { GET, POST } = rutasDeColeccion(presupuestos);
