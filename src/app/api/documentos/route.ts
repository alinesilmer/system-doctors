import { rutasDeColeccion } from '@/lib/api/crud';
import { documentos } from '@/lib/recursos';

export const { GET, POST } = rutasDeColeccion(documentos);
