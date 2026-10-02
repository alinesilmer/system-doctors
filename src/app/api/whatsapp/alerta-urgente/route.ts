import { NextRequest } from 'next/server';
import { marcarUrgente } from '@/lib/firestore/mensajes';
import { datosInvalidos, leerJson, manejarErrores, ok } from '@/lib/api/respuestas';
import { exigirClaveInterna } from '@/lib/api/guardas';
import { claveConversacion, esTelefonoValido } from '@/lib/whatsapp';

// La llama n8n cuando un mensaje se clasifica como urgente o requiere escalar a
// una persona. Marca la conversación para que la bandeja la destaque.
export const POST = manejarErrores(async (req: NextRequest) => {
  exigirClaveInterna(req);

  const { from } = await leerJson(req) as { from?: unknown };
  const telefono = typeof from === 'string' ? claveConversacion(from) : '';
  if (!esTelefonoValido(telefono)) throw datosInvalidos('Missing or invalid from');

  await marcarUrgente(telefono);
  return ok({ ok: true });
}, 'Error al registrar la alerta');
