import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ErrorDeApi, leerJson, manejarErrores, ok, validar } from '@/lib/api/respuestas';
import { generarTexto } from '@/lib/gemini';

const SYSTEM_PROMPT = `You are an AI assistant specialized in generating medical marketing content for private healthcare professionals.

IMPORTANT CONTEXT:
- The user is a doctor or clinic
- Content must be professional, ethical, and compliant
- NEVER make medical promises or guarantees
- NEVER provide diagnosis
- Use clear, simple language for patients
- Tone must be trustworthy and human

INPUT:
- specialty: {{specialty}}
- topic: {{topic}}
- platform: {{platform}}
- tone: {{tone}}
- audience: {{audience}}
- goal: {{goal}}

TASK:
Generate structured content optimized for the selected platform.

OUTPUT FORMAT (STRICT JSON — no markdown, no explanation, just the JSON object):

{
  "title": "short engaging title",
  "caption_variants": [
    "version 1",
    "version 2",
    "version 3"
  ],
  "short_caption": "short version",
  "story_slides": [
    "slide 1",
    "slide 2",
    "slide 3",
    "cta slide"
  ],
  "whatsapp_versions": {
    "short": "short message",
    "medium": "medium message",
    "reminder": "reminder version"
  },
  "hashtags": ["#tag1", "#tag2"],
  "cta": "call to action",
  "image_prompt": "clean prompt for generating a professional medical visual",
  "compliance_notes": [
    "any potential risk or warning"
  ]
}

RULES:
- Keep Instagram captions under 1200 characters
- Story slides must be VERY short (1 sentence each)
- WhatsApp messages must feel personal, not robotic
- Avoid exaggerated language
- Include subtle CTA (e.g. 'consult your doctor', 'book an appointment')
- Use neutral and safe medical phrasing
- Respond ONLY with the JSON object, no extra text`;

const campo = z
  .string({ error: 'Todos los campos son requeridos' })
  .trim()
  .min(1, 'Todos los campos son requeridos')
  .max(300, 'Los campos no pueden superar los 300 caracteres');

const esquemaPedido = z.object({
  specialty: campo, topic: campo, platform: campo, tone: campo, audience: campo, goal: campo,
});

export const POST = manejarErrores(async (req: NextRequest) => {
  const pedido = validar(esquemaPedido, await leerJson(req));

  // Reemplazo con función: un `$&` o `$1` escrito por el usuario no se interpreta como patrón.
  const prompt = SYSTEM_PROMPT.replace(
    /\{\{(\w+)\}\}/g,
    (marcador, clave: string) => pedido[clave as keyof typeof pedido] ?? marcador,
  );

  const texto = await generarTexto([{ role: 'user', text: prompt }], {
    temperatura: 0.8,
    maxTokens: 2048,
    sinRazonamiento: true,
  });

  // Strip markdown code fences if Gemini wraps in ```json
  const cleaned = texto.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return ok({ data: JSON.parse(cleaned) });
  } catch {
    console.error('[contenido/generar] respuesta no parseable:', cleaned.slice(0, 500));
    throw new ErrorDeApi(502, 'La IA devolvió una respuesta inválida. Probá de nuevo.');
  }
}, 'Error al generar contenido');
