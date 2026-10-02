import { NextRequest } from 'next/server';
import {
  getInvitacionPorToken, completarInvitacion, aprobarInvitacion, estaVencida,
} from '@/lib/firestore/invitaciones';
import {
  conflicto, datosInvalidos, leerJson, manejarErrores, noEncontrado, ok, validar,
} from '@/lib/api/respuestas';
import { esquemaRegistroPaciente } from '@/lib/esquemas';

type Contexto = { params: Promise<{ token: string }> };

async function invitacionDe(ctx: Contexto) {
  const { token } = await ctx.params;
  const inv = await getInvitacionPorToken(token);
  if (!inv || estaVencida(inv)) throw noEncontrado('Enlace inválido o expirado');
  return inv;
}

export const GET = manejarErrores(async (_req: NextRequest, ctx: Contexto) => {
  const inv = await invitacionDe(ctx);
  return ok({ data: { estado: inv.estado } });
}, 'Error al validar el enlace');

// Endpoint público: lo usa el paciente desde el enlace, sin sesión. Sólo se
// guardan los campos del formulario de registro, validados y acotados.
export const POST = manejarErrores(async (req: NextRequest, ctx: Contexto) => {
  const inv = await invitacionDe(ctx);
  const datos = validar(esquemaRegistroPaciente, await leerJson(req));

  if (!await completarInvitacion(inv.id, datos)) throw conflicto('Este formulario ya fue completado');
  return ok({ mensaje: 'Datos recibidos correctamente. El médico revisará tu información.' });
}, 'Error al guardar el formulario');

export const PUT = manejarErrores(async (_req: NextRequest, ctx: Contexto) => {
  const inv = await invitacionDe(ctx);
  if (inv.estado === 'aprobado') throw conflicto('Esta invitación ya fue aprobada');
  if (!inv.datosPaciente) throw datosInvalidos('No hay datos para aprobar');

  // Se vuelve a validar: lo guardado pudo cargarse antes de que existiera el esquema.
  const datos = validar(esquemaRegistroPaciente, inv.datosPaciente);
  const pacienteId = await aprobarInvitacion(inv.id, datos);
  if (!pacienteId) throw conflicto('Esta invitación ya fue aprobada');

  return ok({ data: { pacienteId }, mensaje: 'Paciente creado correctamente' });
}, 'Error al aprobar la invitación');
