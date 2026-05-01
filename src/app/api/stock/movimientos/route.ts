import { NextResponse } from 'next/server';
import { getMovimientos } from '@/lib/firestore/stock';

export async function GET() {
  try {
    const movimientos = await getMovimientos();
    return NextResponse.json({ items: movimientos });
  } catch {
    return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 });
  }
}
