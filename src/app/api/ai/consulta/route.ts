import { NextRequest } from 'next/server';
import { z } from 'zod';
import { leerJson, manejarErrores, ok, validar } from '@/lib/api/respuestas';
import { generarTexto } from '@/lib/gemini';

const SYSTEM_PROMPT = `Eres un asistente médico experto integrado en MediSystem, un sistema de gestión para consultorios médicos.
Tu rol es ayudar a médicos y profesionales de la salud a:
1. Generar notas clínicas estructuradas a partir de dictados de voz o descripciones libres
2. Sugerir diagnósticos diferenciales basados en síntomas y anamnesis
3. Redactar entradas completas para historias clínicas
4. Responder consultas clínicas con fundamento médico

Responde SIEMPRE en español. Sé preciso, profesional y conciso.

Cuando el médico te pida generar una nota clínica o historia clínica, usa exactamente este formato markdown:
**Motivo de consulta:** [texto]
**Anamnesis:** [texto]
**Examen físico:** [texto o "No referido"]
**Diagnóstico presuntivo:** [texto]
**Plan y tratamiento:** [texto]

Al final de cualquier nota clínica completa, siempre incluye la línea exacta:
[NOTA_LISTA]

Si el médico solo hace una pregunta clínica o pide información, responde directamente sin ese formato.`;

const esquemaConsulta = z.object({
  mensajes: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(20_000),
  })).min(1, 'Falta el mensaje a enviar').max(60, 'La conversación es demasiado larga: empezá una nueva'),
  contexto: z.string().max(2_000).optional(),
});

export const POST = manejarErrores(async (req: NextRequest) => {
  const { mensajes, contexto } = validar(esquemaConsulta, await leerJson(req));

  const respuesta = await generarTexto(
    mensajes.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.content })),
    {
      instruccionDeSistema: contexto
        ? `${SYSTEM_PROMPT}\n\nContexto del paciente:\n${contexto}`
        : SYSTEM_PROMPT,
      temperatura: 0.35,
      maxTokens: 1200,
    },
  );

  return ok({ respuesta, esNota: respuesta.includes('[NOTA_LISTA]') });
}, 'No se pudo procesar la consulta');
