import { NextRequest, NextResponse } from 'next/server';
import { getTratamiento, actualizarTratamiento, eliminarTratamiento } from '@/lib/firestore/tratamientos';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tratamiento = await getTratamiento(id);
    if (!tratamiento) return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 });
    return NextResponse.json({ data: tratamiento });
  } catch {
    return NextResponse.json({ error: 'Error al obtener tratamiento' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await actualizarTratamiento(id, body);
    return NextResponse.json({ mensaje: 'Tratamiento actualizado correctamente' });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar tratamiento' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await eliminarTratamiento(id);
    return NextResponse.json({ mensaje: 'Tratamiento eliminado correctamente' });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar tratamiento' }, { status: 500 });
  }
}
