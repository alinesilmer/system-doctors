import { rutasDeColeccion } from '@/lib/api/crud';
import { pacientes } from '@/lib/recursos';

export const { GET, POST } = rutasDeColeccion(pacientes);
