import { rutasDeDocumento } from '@/lib/api/crud';
import { presupuestos } from '@/lib/recursos';

export const { GET, PUT, PATCH, DELETE } = rutasDeDocumento(presupuestos);
