import { NextRequest, NextResponse } from 'next/server';
import { getDocumentos, crearDocumento } from '@/lib/firestore/documentos';
import type { Documento } from '@/lib/types';

export async function GET() {
  try {
    const items = await getDocumentos();
    return NextResponse.json({ items, total: items.length });
  } catch {
    return NextResponse.json({ error: 'Error al obtener documentos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<Documento, 'id' | 'creadoEn' | 'actualizadoEn'>;
    if (!body.titulo || !body.tipo || !body.contenido) {
      return NextResponse.json({ error: 'Título, tipo y contenido son requeridos' }, { status: 400 });
    }
    const id = await crearDocumento(body);
    return NextResponse.json({ data: { id }, mensaje: 'Documento creado correctamente' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear documento' }, { status: 500 });
  }
}
