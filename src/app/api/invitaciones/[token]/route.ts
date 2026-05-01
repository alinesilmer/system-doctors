import { NextRequest, NextResponse } from 'next/server';
import {
  getInvitacionPorToken, completarInvitacion, aprobarInvitacion,
} from '@/lib/firestore/invitaciones';
import { crearPaciente } from '@/lib/firestore/pacientes';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const inv = await getInvitacionPorToken(token);
    if (!inv) return NextResponse.json({ error: 'Enlace inválido o expirado' }, { status: 404 });
    return NextResponse.json({ data: { estado: inv.estado } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const inv = await getInvitacionPorToken(token);
    if (!inv) return NextResponse.json({ error: 'Enlace inválido o expirado' }, { status: 404 });
    if (inv.estado !== 'pendiente') return NextResponse.json({ error: 'Este formulario ya fue completado' }, { status: 409 });

    const datos = await req.json();
    await completarInvitacion(inv.id, datos);
    return NextResponse.json({ mensaje: 'Datos recibidos correctamente. El médico revisará tu información.' });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const inv = await getInvitacionPorToken(token);
    if (!inv || inv.estado !== 'completado') {
      return NextResponse.json({ error: 'No hay datos para aprobar' }, { status: 400 });
    }
    if (!inv.datosPaciente) return NextResponse.json({ error: 'Sin datos de paciente' }, { status: 400 });

    const pacienteId = await crearPaciente(inv.datosPaciente);
    await aprobarInvitacion(inv.id);
    return NextResponse.json({ data: { pacienteId }, mensaje: 'Paciente creado correctamente' });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
