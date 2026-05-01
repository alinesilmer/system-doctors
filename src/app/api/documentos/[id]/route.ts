import { NextRequest, NextResponse } from 'next/server';
import { getDocumento, actualizarDocumento, eliminarDocumento } from '@/lib/firestore/documentos';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await getDocumento(id);
    if (!doc) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    return NextResponse.json({ data: doc });
  } catch {
    return NextResponse.json({ error: 'Error al obtener documento' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await actualizarDocumento(id, body);
    return NextResponse.json({ mensaje: 'Documento actualizado correctamente' });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar documento' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await eliminarDocumento(id);
    return NextResponse.json({ mensaje: 'Documento eliminado correctamente' });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar documento' }, { status: 500 });
  }
}
