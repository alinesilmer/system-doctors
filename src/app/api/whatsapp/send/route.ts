import { NextRequest } from 'next/server';
import { z } from 'zod';
import { enviarMensajeWhatsApp, esTelefonoValido, MAX_LARGO_MENSAJE } from '@/lib/whatsapp';
import { guardarMensajeSaliente, marcarRespondido } from '@/lib/firestore/mensajes';
import { ErrorDeApi, leerJson, manejarErrores, ok, validar } from '@/lib/api/respuestas';

const esquemaEnvio = z.object({
  telefono: z.string({ error: 'telefono y mensaje son requeridos' }).refine(esTelefonoValido, 'Teléfono inválido'),
  mensaje: z
    .string({ error: 'telefono y mensaje son requeridos' })
    .trim()
    .min(1, 'telefono y mensaje son requeridos')
    .max(MAX_LARGO_MENSAJE, 'El mensaje es demasiado largo'),
  mensajeId: z.string().regex(/^[\w-]{1,64}$/, 'mensajeId inválido').optional(),
});

export const POST = manejarErrores(async (req: NextRequest) => {
  const { telefono, mensaje, mensajeId } = validar(esquemaEnvio, await leerJson(req));

  if (!await enviarMensajeWhatsApp(telefono, mensaje)) {
    throw new ErrorDeApi(502, 'No se pudo enviar el mensaje por WhatsApp');
  }

  await guardarMensajeSaliente(telefono, mensaje);
  if (mensajeId) await marcarRespondido(telefono, mensajeId);

  return ok({ ok: true });
}, 'Error al enviar el mensaje');
