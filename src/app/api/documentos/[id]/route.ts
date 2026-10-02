import { rutasDeDocumento } from '@/lib/api/crud';
import { documentos } from '@/lib/recursos';

export const { GET, PUT, PATCH, DELETE } = rutasDeDocumento(documentos);
