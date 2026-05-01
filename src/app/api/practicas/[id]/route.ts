import { NextRequest, NextResponse } from 'next/server';
import { getPractica, actualizarPractica, eliminarPractica } from '@/lib/firestore/practicas';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const practica = await getPractica(id);
    if (!practica) return NextResponse.json({ error: 'Práctica no encontrada' }, { status: 404 });
    return NextResponse.json({ data: practica });
  } catch {
    return NextResponse.json({ error: 'Error al obtener práctica' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await actualizarPractica(id, body);
    return NextResponse.json({ mensaje: 'Práctica actualizada correctamente' });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar práctica' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await eliminarPractica(id);
    return NextResponse.json({ mensaje: 'Práctica eliminada correctamente' });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar práctica' }, { status: 500 });
  }
}
