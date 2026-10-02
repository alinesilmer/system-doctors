import { rutasDeDocumento } from '@/lib/api/crud';
import { pacientes } from '@/lib/recursos';

export const { GET, PUT, PATCH, DELETE } = rutasDeDocumento(pacientes);
