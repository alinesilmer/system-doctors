import { rutasDeColeccion } from '@/lib/api/crud';
import { stock } from '@/lib/recursos';

export const { GET, POST } = rutasDeColeccion(stock);
