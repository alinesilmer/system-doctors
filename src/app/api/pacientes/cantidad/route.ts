import { manejarErrores, ok } from '@/lib/api/respuestas';
import { repositorioPacientes } from '@/lib/firestore/pacientes';

// Sólo el número: el inicio lo muestra sin descargar todas las fichas.
export const GET = manejarErrores(async () => {
  return ok({ data: { cantidad: await repositorioPacientes.contar() } });
}, 'Error al contar pacientes');
