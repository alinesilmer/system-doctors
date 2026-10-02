import { rutasDeDocumento } from '@/lib/api/crud';
import { practicas } from '@/lib/recursos';

export const { GET, PUT, PATCH, DELETE } = rutasDeDocumento(practicas);
