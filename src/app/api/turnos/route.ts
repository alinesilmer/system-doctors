import { NextRequest, NextResponse } from 'next/server';
import { getTurnos, crearTurno } from '@/lib/firestore/turnos';
import type { Turno } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const desde = searchParams.get('desde') ?? undefined;
    const hasta = searchParams.get('hasta') ?? undefined;
    const turnos = await getTurnos(desde, hasta);
    return NextResponse.json({ items: turnos, total: turnos.length });
  } catch (e) {
    const msg = (e as Error).message ?? '';
    return NextResponse.json({ error: 'Error al obtener turnos', detalle: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<Turno, 'id' | 'creadoEn' | 'actualizadoEn'>;
    if (!body.pacienteId || !body.fecha || !body.horaInicio) {
      return NextResponse.json({ error: 'Paciente, fecha y hora de inicio son requeridos' }, { status: 400 });
    }
    const id = await crearTurno({ ...body, estado: body.estado ?? 'pendiente' });
    return NextResponse.json({ data: { id }, mensaje: 'Turno creado correctamente' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Error al crear turno' }, { status: 500 });
  }
}
