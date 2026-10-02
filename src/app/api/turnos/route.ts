import { NextRequest } from 'next/server';
import { z } from 'zod';
import { rutasDeColeccion } from '@/lib/api/crud';
import { manejarErrores, ok, validar } from '@/lib/api/respuestas';
import { fechaIso } from '@/lib/esquemas';
import { getTurnos } from '@/lib/firestore/turnos';
import { turnos } from '@/lib/recursos';

export const { POST } = rutasDeColeccion(turnos);

const esquemaRango = z.object({ desde: fechaIso.optional(), hasta: fechaIso.optional() });

// El listado admite un rango de fechas: la agenda y el inicio piden sólo la
// semana a la vista en lugar de todo el historial de turnos.
export const GET = manejarErrores(async (req: NextRequest) => {
  const { desde, hasta } = validar(esquemaRango, {
    desde: req.nextUrl.searchParams.get('desde') ?? undefined,
    hasta: req.nextUrl.searchParams.get('hasta') ?? undefined,
  });
  const items = await getTurnos(desde, hasta);
  return ok({ items, total: items.length });
}, 'Error al obtener turnos');
