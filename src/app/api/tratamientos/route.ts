import { NextRequest, NextResponse } from 'next/server';
import { getTratamientos, crearTratamiento } from '@/lib/firestore/tratamientos';
import type { Tratamiento } from '@/lib/types';

export async function GET() {
  try {
    const items = await getTratamientos();
    return NextResponse.json({ items, total: items.length });
  } catch {
    return NextResponse.json({ error: 'Error al obtener tratamientos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<Tratamiento, 'id' | 'creadoEn' | 'actualizadoEn'>;
    if (!body.nombre) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
    }
    const id = await crearTratamiento(body);
    return NextResponse.json({ data: { id }, mensaje: 'Tratamiento creado correctamente' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear tratamiento' }, { status: 500 });
  }
}
