import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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

interface Mensaje {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Configurá GEMINI_API_KEY en .env.local (gratuito en aistudio.google.com)' },
      { status: 500 }
    );
  }

  const { mensajes, contexto } = await req.json() as { mensajes: Mensaje[]; contexto?: string };

  const systemWithContext = contexto
    ? `${SYSTEM_PROMPT}\n\nContexto del paciente:\n${contexto}`
    : SYSTEM_PROMPT;

  const contents = mensajes.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = {
    system_instruction: { parts: [{ text: systemWithContext }] },
    contents,
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 1200,
    },
  };

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: 'Error en Gemini API', detalle: err }, { status: 500 });
    }

    const data = await res.json();
    const respuesta: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const esNota = respuesta.includes('[NOTA_LISTA]');

    return NextResponse.json({ respuesta, esNota });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
