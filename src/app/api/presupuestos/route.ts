import { NextRequest, NextResponse } from 'next/server';
import { getPresupuestos, crearPresupuesto } from '@/lib/firestore/presupuestos';
import type { Presupuesto } from '@/lib/types';

export async function GET() {
  try {
    const items = await getPresupuestos();
    return NextResponse.json({ items, total: items.length });
  } catch {
    return NextResponse.json({ error: 'Error al obtener presupuestos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<Presupuesto, 'id' | 'creadoEn' | 'actualizadoEn'>;
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'El presupuesto debe tener al menos un ítem' }, { status: 400 });
    }
    const id = await crearPresupuesto(body);
    return NextResponse.json({ data: { id }, mensaje: 'Presupuesto creado correctamente' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear presupuesto' }, { status: 500 });
  }
}
