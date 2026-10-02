import { rutasDeDocumento } from '@/lib/api/crud';
import { tratamientos } from '@/lib/recursos';

export const { GET, PUT, PATCH, DELETE } = rutasDeDocumento(tratamientos);
