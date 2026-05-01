import { NextRequest, NextResponse } from 'next/server';
import { getHistoriaClinica, crearEntradaHistoriaClinica } from '@/lib/firestore/pacientes';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const entradas = await getHistoriaClinica(id);
    return NextResponse.json({ items: entradas });
  } catch (e) {
    return NextResponse.json({ error: 'Error al obtener historia clínica' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.tipo || !body.titulo || !body.contenido) {
      return NextResponse.json({ error: 'Tipo, título y contenido son requeridos' }, { status: 400 });
    }
    const entradaId = await crearEntradaHistoriaClinica(id, { ...body, pacienteId: id });
    return NextResponse.json({ data: { id: entradaId }, mensaje: 'Entrada creada correctamente' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Error al crear entrada' }, { status: 500 });
  }
}
