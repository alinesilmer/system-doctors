import { rutasDeColeccion } from '@/lib/api/crud';
import { practicas } from '@/lib/recursos';

export const { GET, POST } = rutasDeColeccion(practicas);
