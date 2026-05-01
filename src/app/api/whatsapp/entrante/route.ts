import { NextRequest, NextResponse } from 'next/server';
import { guardarMensajeEntrante } from '@/lib/firestore/mensajes';

// Called by n8n after classifying each incoming WhatsApp message.
// Validates the shared internal key so it's never reachable without auth.
export async function POST(req: NextRequest) {
  const key = req.headers.get('x-internal-key');
  if (key !== process.env.MEDISYSTEM_INTERNAL_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      from: string;
      name?: string;
      text: string;
      intent?: string;
      needsHuman?: boolean;
      timestamp?: number;
    };

    if (!body.from || !body.text) {
      return NextResponse.json({ error: 'Missing from or text' }, { status: 400 });
    }

    // Map n8n intent → existing clasificacion/urgencia/derivarA schema
    const intentMap: Record<string, { clasificacion: string; urgencia: 'alta' | 'media' | 'baja'; derivarA: 'medico' | 'secretaria' | 'automatico' }> = {
      urgente:  { clasificacion: 'urgencia',     urgencia: 'alta',  derivarA: 'medico' },
      turno:    { clasificacion: 'turno',         urgencia: 'baja',  derivarA: 'automatico' },
      cancelar: { clasificacion: 'turno',         urgencia: 'baja',  derivarA: 'secretaria' },
      consulta: { clasificacion: 'consulta_medica', urgencia: 'media', derivarA: 'medico' },
      otro:     { clasificacion: 'otro',          urgencia: 'baja',  derivarA: 'secretaria' },
    };

    const mapped = intentMap[body.intent ?? 'otro'] ?? intentMap.otro;

    await guardarMensajeEntrante({
      telefono: body.from,
      nombre: body.name,
      cuerpo: body.text,
      clasificacion: mapped.clasificacion,
      urgencia: mapped.urgencia,
      derivarA: mapped.derivarA,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
