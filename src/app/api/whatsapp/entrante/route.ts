import { NextRequest } from 'next/server';
import { guardarMensajeEntrante } from '@/lib/firestore/mensajes';
import { datosInvalidos, leerJson, manejarErrores, ok } from '@/lib/api/respuestas';
import { exigirClaveInterna } from '@/lib/api/guardas';
import { claveConversacion, esTelefonoValido, MAX_LARGO_MENSAJE } from '@/lib/whatsapp';

interface MensajeDeN8n {
  from?: string;
  name?: string;
  text?: string;
  intent?: string;
}

/** Traducción del `intent` que manda n8n al esquema interno de clasificación. */
const POR_INTENT = {
  urgente:  { clasificacion: 'urgencia',          urgencia: 'alta',  derivarA: 'medico' },
  turno:    { clasificacion: 'turno',             urgencia: 'baja',  derivarA: 'automatico' },
  cancelar: { clasificacion: 'turno',             urgencia: 'baja',  derivarA: 'secretaria' },
  consulta: { clasificacion: 'consulta_medica',   urgencia: 'media', derivarA: 'medico' },
  otro:     { clasificacion: 'otro',              urgencia: 'baja',  derivarA: 'secretaria' },
} as const;

// La llama n8n después de clasificar cada mensaje entrante de WhatsApp.
export const POST = manejarErrores(async (req: NextRequest) => {
  exigirClaveInterna(req);

  const { from, name, text, intent } = await leerJson(req) as MensajeDeN8n;
  if (typeof from !== 'string' || typeof text !== 'string' || !text) {
    throw datosInvalidos('Missing from or text');
  }
  const telefono = claveConversacion(from);
  if (!esTelefonoValido(telefono)) throw datosInvalidos('Invalid from');

  const mapeado = POR_INTENT[intent as keyof typeof POR_INTENT] ?? POR_INTENT.otro;

  await guardarMensajeEntrante({
    telefono,
    nombre: typeof name === 'string' ? name.slice(0, 120) : undefined,
    cuerpo: text.slice(0, MAX_LARGO_MENSAJE),
    clasificacion: mapeado.clasificacion,
    urgencia: mapeado.urgencia,
    derivarA: mapeado.derivarA,
  });

  return ok({ ok: true });
}, 'Error al registrar el mensaje entrante');
