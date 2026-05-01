import { NextRequest, NextResponse } from 'next/server';
import { getPaciente, actualizarPaciente, eliminarPaciente } from '@/lib/firestore/pacientes';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const paciente = await getPaciente(id);
    if (!paciente) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    return NextResponse.json({ data: paciente });
  } catch (e) {
    return NextResponse.json({ error: 'Error al obtener paciente' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await actualizarPaciente(id, body);
    return NextResponse.json({ mensaje: 'Paciente actualizado correctamente' });
  } catch (e) {
    return NextResponse.json({ error: 'Error al actualizar paciente' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await eliminarPaciente(id);
    return NextResponse.json({ mensaje: 'Paciente eliminado correctamente' });
  } catch (e) {
    return NextResponse.json({ error: 'Error al eliminar paciente' }, { status: 500 });
  }
}
