import { NextRequest, NextResponse } from 'next/server';
import { getPracticas, crearPractica } from '@/lib/firestore/practicas';
import type { Practica } from '@/lib/types';

export async function GET() {
  try {
    const items = await getPracticas();
    return NextResponse.json({ items, total: items.length });
  } catch {
    return NextResponse.json({ error: 'Error al obtener prácticas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<Practica, 'id' | 'creadoEn' | 'actualizadoEn'>;
    if (!body.nombre || body.precio === undefined) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 });
    }
    const id = await crearPractica(body);
    return NextResponse.json({ data: { id }, mensaje: 'Práctica creada correctamente' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear práctica' }, { status: 500 });
  }
}
