import { NextRequest, NextResponse } from 'next/server';
import { getTurno, actualizarTurno, eliminarTurno } from '@/lib/firestore/turnos';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const turno = await getTurno(id);
    if (!turno) return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
    return NextResponse.json({ data: turno });
  } catch (e) {
    return NextResponse.json({ error: 'Error al obtener turno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await actualizarTurno(id, body);
    return NextResponse.json({ mensaje: 'Turno actualizado correctamente' });
  } catch (e) {
    return NextResponse.json({ error: 'Error al actualizar turno' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await eliminarTurno(id);
    return NextResponse.json({ mensaje: 'Turno eliminado correctamente' });
  } catch (e) {
    return NextResponse.json({ error: 'Error al eliminar turno' }, { status: 500 });
  }
}
