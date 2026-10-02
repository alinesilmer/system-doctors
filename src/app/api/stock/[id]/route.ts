import { rutasDeDocumento } from '@/lib/api/crud';
import { stock } from '@/lib/recursos';

export const { GET, PUT, PATCH, DELETE } = rutasDeDocumento(stock);
