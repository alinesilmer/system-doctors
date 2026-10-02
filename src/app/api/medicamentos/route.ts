import { rutasDeColeccion } from '@/lib/api/crud';
import { medicamentos } from '@/lib/recursos';

export const { GET, POST } = rutasDeColeccion(medicamentos);
