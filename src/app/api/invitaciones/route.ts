import { crearInvitacion, getInvitaciones } from '@/lib/firestore/invitaciones';
import { manejarErrores, ok } from '@/lib/api/respuestas';

export const GET = manejarErrores(async () => {
  return ok({ items: await getInvitaciones() });
}, 'Error al obtener las invitaciones');

export const POST = manejarErrores(async () => {
  const { id, token } = await crearInvitacion();
  return ok({ data: { id, token } }, 201);
}, 'Error al crear la invitación');
