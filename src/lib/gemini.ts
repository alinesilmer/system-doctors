import { ErrorDeApi } from './api/respuestas';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface TurnoDeChat {
  role: 'user' | 'model';
  text: string;
}

interface Opciones {
  instruccionDeSistema?: string;
  temperatura?: number;
  maxTokens?: number;
  /** Desactiva el razonamiento interno del modelo: más rápido y barato para texto simple. */
  sinRazonamiento?: boolean;
}

/**
 * Llama a Gemini y devuelve el texto de la respuesta. Los fallos del proveedor
 * se registran en el servidor y salen como un error genérico: el detalle puede
 * incluir la clave o el prompt y no debe llegar al navegador.
 */
export async function generarTexto(turnos: TurnoDeChat[], opciones: Opciones = {}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[gemini] Falta GEMINI_API_KEY en el entorno');
    throw new ErrorDeApi(503, 'El asistente de IA no está configurado');
  }

  const { instruccionDeSistema, temperatura = 0.5, maxTokens = 1200, sinRazonamiento } = opciones;

  let res: Response;
  try {
    res = await fetch(GEMINI_URL, {
      method: 'POST',
      // La clave va en un header y no en la URL, que termina en logs y trazas.
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        ...(instruccionDeSistema && { system_instruction: { parts: [{ text: instruccionDeSistema }] } }),
        contents: turnos.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        generationConfig: {
          temperature: temperatura,
          maxOutputTokens: maxTokens,
          ...(sinRazonamiento && { thinkingConfig: { thinkingBudget: 0 } }),
        },
      }),
    });
  } catch (e) {
    console.error('[gemini]', e);
    throw new ErrorDeApi(502, 'El asistente no está disponible en este momento');
  }

  if (!res.ok) {
    console.error('[gemini] respondió', res.status, await res.text());
    throw new ErrorDeApi(502, 'El asistente no está disponible en este momento');
  }

  const data = await res.json();
  // Los modelos con razonamiento devuelven varias partes: nos quedamos con la que no es "thought".
  const partes: { text?: string; thought?: boolean }[] = data?.candidates?.[0]?.content?.parts ?? [];
  return partes.find((p) => !p.thought && p.text)?.text ?? partes.find((p) => p.text)?.text ?? '';
}
