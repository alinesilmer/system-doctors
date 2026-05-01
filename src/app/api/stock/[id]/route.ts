import { NextRequest, NextResponse } from 'next/server';
import { getItemStock, actualizarItemStock, eliminarItemStock } from '@/lib/firestore/stock';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await getItemStock(id);
    if (!item) return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
    return NextResponse.json({ data: item });
  } catch (e) {
    return NextResponse.json({ error: 'Error al obtener item' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await actualizarItemStock(id, body);
    return NextResponse.json({ mensaje: 'Item actualizado correctamente' });
  } catch (e) {
    return NextResponse.json({ error: 'Error al actualizar item' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await eliminarItemStock(id);
    return NextResponse.json({ mensaje: 'Item eliminado correctamente' });
  } catch (e) {
    return NextResponse.json({ error: 'Error al eliminar item' }, { status: 500 });
  }
}
