import { NextRequest, NextResponse } from 'next/server';
import { enviarMensajeWhatsApp } from '@/lib/whatsapp';
import { guardarMensajeSaliente, marcarRespondido } from '@/lib/firestore/mensajes';

export async function POST(req: NextRequest) {
  try {
    const { telefono, mensaje, mensajeId } = await req.json() as {
      telefono: string;
      mensaje: string;
      mensajeId?: string;
    };

    if (!telefono || !mensaje) {
      return NextResponse.json({ error: 'telefono y mensaje son requeridos' }, { status: 400 });
    }

    const enviado = await enviarMensajeWhatsApp(telefono, mensaje);
    if (!enviado) {
      return NextResponse.json({ error: 'No se pudo enviar el mensaje. Verificá WA_ACCESS_TOKEN y WA_PHONE_NUMBER_ID.' }, { status: 500 });
    }

    await guardarMensajeSaliente(telefono, mensaje);
    if (mensajeId) await marcarRespondido(telefono, mensajeId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
