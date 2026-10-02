import { rutasDeDocumento } from '@/lib/api/crud';
import { turnos } from '@/lib/recursos';

export const { GET, PUT, PATCH, DELETE } = rutasDeDocumento(turnos);
