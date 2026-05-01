import { NextRequest, NextResponse } from 'next/server';
import { getConversaciones, getMensajes, marcarLeidos } from '@/lib/firestore/mensajes';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const telefono = searchParams.get('telefono');

  try {
    if (telefono) {
      const mensajes = await getMensajes(telefono);
      await marcarLeidos(telefono);
      return NextResponse.json({ items: mensajes });
    }
    const conversaciones = await getConversaciones();
    return NextResponse.json({ items: conversaciones });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
