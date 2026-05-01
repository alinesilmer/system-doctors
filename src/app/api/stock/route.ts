import { NextRequest, NextResponse } from 'next/server';
import { getStock, crearItemStock } from '@/lib/firestore/stock';
import type { ItemStock } from '@/lib/types';

export async function GET() {
  try {
    const items = await getStock();
    return NextResponse.json({ items, total: items.length });
  } catch (e) {
    return NextResponse.json({ error: 'Error al obtener stock' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<ItemStock, 'id' | 'creadoEn' | 'actualizadoEn'>;
    if (!body.nombre || !body.categoria) {
      return NextResponse.json({ error: 'Nombre y categoría son requeridos' }, { status: 400 });
    }
    const id = await crearItemStock({ ...body, cantidad: body.cantidad ?? 0, cantidadMinima: body.cantidadMinima ?? 0 });
    return NextResponse.json({ data: { id }, mensaje: 'Item creado correctamente' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Error al crear item' }, { status: 500 });
  }
}
