import { NextRequest, NextResponse } from 'next/server';
import { getPresupuesto, actualizarPresupuesto, eliminarPresupuesto } from '@/lib/firestore/presupuestos';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const presupuesto = await getPresupuesto(id);
    if (!presupuesto) return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });
    return NextResponse.json({ data: presupuesto });
  } catch {
    return NextResponse.json({ error: 'Error al obtener presupuesto' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await actualizarPresupuesto(id, body);
    return NextResponse.json({ mensaje: 'Presupuesto actualizado correctamente' });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar presupuesto' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await eliminarPresupuesto(id);
    return NextResponse.json({ mensaje: 'Presupuesto eliminado correctamente' });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar presupuesto' }, { status: 500 });
  }
}
