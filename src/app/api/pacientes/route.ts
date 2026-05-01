import { NextRequest, NextResponse } from 'next/server';
import { getPacientes, crearPaciente } from '@/lib/firestore/pacientes';
import type { Paciente } from '@/lib/types';

export async function GET() {
  try {
    const pacientes = await getPacientes();
    return NextResponse.json({ items: pacientes, total: pacientes.length });
  } catch (e) {
    return NextResponse.json({ error: 'Error al obtener pacientes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<Paciente, 'id' | 'creadoEn' | 'actualizadoEn'>;
    if (!body.nombre || !body.apellido || !body.dni) {
      return NextResponse.json({ error: 'Nombre, apellido y DNI son requeridos' }, { status: 400 });
    }
    const id = await crearPaciente(body);
    return NextResponse.json({ data: { id }, mensaje: 'Paciente creado correctamente' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Error al crear paciente' }, { status: 500 });
  }
}
