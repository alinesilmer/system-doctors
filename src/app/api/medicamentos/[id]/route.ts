import { rutasDeDocumento } from '@/lib/api/crud';
import { medicamentos } from '@/lib/recursos';

export const { GET, PUT, PATCH, DELETE } = rutasDeDocumento(medicamentos);
