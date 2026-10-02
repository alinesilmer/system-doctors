import { rutasDeColeccion } from '@/lib/api/crud';
import { tratamientos } from '@/lib/recursos';

export const { GET, POST } = rutasDeColeccion(tratamientos);
