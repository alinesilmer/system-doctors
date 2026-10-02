import { NextRequest } from 'next/server';
import { getHistoriaClinica, crearEntradaHistoriaClinica, getPaciente } from '@/lib/firestore/pacientes';
import { leerJson, manejarErrores, noEncontrado, ok, validar } from '@/lib/api/respuestas';
import { esquemaEntradaHistoriaClinica } from '@/lib/esquemas';
import { hoyIso } from '@/lib/fechas';

type Contexto = { params: Promise<{ id: string }> };

export const GET = manejarErrores(async (_req: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  return ok({ items: await getHistoriaClinica(id) });
}, 'Error al obtener historia clínica');

export const POST = manejarErrores(async (req: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const cuerpo = await leerJson(req);
  const entrada = validar(esquemaEntradaHistoriaClinica, { fecha: hoyIso(), ...(cuerpo as object) });

  // Sin esta comprobación la entrada quedaría colgada de un paciente que no existe.
  if (!await getPaciente(id)) throw noEncontrado('Paciente no encontrado');

  const entradaId = await crearEntradaHistoriaClinica(id, { ...entrada, pacienteId: id });
  return ok({ data: { id: entradaId }, mensaje: 'Entrada creada correctamente' }, 201);
}, 'Error al crear entrada');
