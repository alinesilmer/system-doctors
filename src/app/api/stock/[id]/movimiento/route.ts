import { NextRequest, NextResponse } from 'next/server';
import { getItemStock, registrarMovimiento } from '@/lib/firestore/stock';
import { getMovimientos } from '@/lib/firestore/stock';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tipo, cantidad, motivo } = body;

    if (!tipo || cantidad == null) {
      return NextResponse.json({ error: 'Tipo y cantidad son requeridos' }, { status: 400 });
    }

    const item = await getItemStock(id);
    if (!item) return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });

    if (tipo === 'salida' && item.cantidad < cantidad) {
      return NextResponse.json({ error: 'Stock insuficiente para registrar salida' }, { status: 400 });
    }

    await registrarMovimiento(item, tipo, cantidad, motivo);
    return NextResponse.json({ mensaje: 'Movimiento registrado correctamente' });
  } catch (e) {
    return NextResponse.json({ error: 'Error al registrar movimiento' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const movimientos = await getMovimientos();
    return NextResponse.json({ items: movimientos });
  } catch (e) {
    return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 });
  }
}
