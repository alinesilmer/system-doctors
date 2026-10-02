import type { NextRequest } from 'next/server';
import type { z } from 'zod';
import type { DatosNuevos, EntidadBase, Repositorio } from '@/lib/firestore/repository';
import { leerJson, manejarErrores, noEncontrado, ok, validar } from './respuestas';

/** Esquema de alta de una entidad, que además sabe derivar el de actualización. */
type EsquemaDe<D> = z.ZodType<D> & { partial(): z.ZodType<Partial<D>> };

export interface RecursoCrud<T extends EntidadBase> {
  repo: Repositorio<T>;
  esquema: EsquemaDe<DatosNuevos<T>>;
  /** Nombre de la entidad en singular, con mayúscula inicial: "Paciente". */
  etiqueta: string;
  /** Para concordar los mensajes: "Práctica creada" vs. "Paciente creado". */
  femenino?: boolean;
  /** Valores que completa el servidor en el alta cuando el cliente no los manda. */
  porDefecto?: Partial<DatosNuevos<T>>;
}

type ContextoId = { params: Promise<{ id: string }> };

function mensajes({ etiqueta, femenino }: RecursoCrud<never>) {
  const o = femenino ? 'a' : 'o';
  const sujeto = etiqueta.toLowerCase();
  return {
    creado: `${etiqueta} cread${o} correctamente`,
    actualizado: `${etiqueta} actualizad${o} correctamente`,
    eliminado: `${etiqueta} eliminad${o} correctamente`,
    inexistente: `${etiqueta} no encontrad${o}`,
    errorListar: `Error al obtener ${sujeto}`,
    errorCrear: `Error al crear ${sujeto}`,
    errorActualizar: `Error al actualizar ${sujeto}`,
    errorEliminar: `Error al eliminar ${sujeto}`,
  };
}

/** Handlers `GET` (listar) y `POST` (crear) para `app/api/<recurso>/route.ts`. */
export function rutasDeColeccion<T extends EntidadBase>(recurso: RecursoCrud<T>) {
  const m = mensajes(recurso as RecursoCrud<never>);

  const GET = manejarErrores(async () => {
    const items = await recurso.repo.listar();
    return ok({ items, total: items.length });
  }, m.errorListar);

  const POST = manejarErrores(async (req: NextRequest) => {
    const cuerpo = await leerJson(req);
    const datos = validar(recurso.esquema, { ...recurso.porDefecto, ...(cuerpo as object) });
    const id = await recurso.repo.crear(datos);
    return ok({ data: { id }, mensaje: m.creado }, 201);
  }, m.errorCrear);

  return { GET, POST };
}

/**
 * Handlers por id para `app/api/<recurso>/[id]/route.ts`. `PUT` y `PATCH` son el
 * mismo handler: ambos actualizan sólo los campos enviados.
 */
export function rutasDeDocumento<T extends EntidadBase>(recurso: RecursoCrud<T>) {
  const m = mensajes(recurso as RecursoCrud<never>);
  const esquemaParcial = recurso.esquema.partial();

  const GET = manejarErrores(async (_req: NextRequest, { params }: ContextoId) => {
    const { id } = await params;
    const dato = await recurso.repo.obtener(id);
    if (!dato) throw noEncontrado(m.inexistente);
    return ok({ data: dato });
  }, m.errorListar);

  const actualizar = manejarErrores(async (req: NextRequest, { params }: ContextoId) => {
    const { id } = await params;
    const cambios = validar(esquemaParcial, await leerJson(req));
    try {
      await recurso.repo.actualizar(id, cambios as Partial<T>);
    } catch (e) {
      // Firestore avisa si el documento no existe: no hace falta leerlo antes.
      if ((e as { code?: string }).code === 'not-found') throw noEncontrado(m.inexistente);
      throw e;
    }
    return ok({ mensaje: m.actualizado });
  }, m.errorActualizar);

  const DELETE = manejarErrores(async (_req: NextRequest, { params }: ContextoId) => {
    const { id } = await params;
    await recurso.repo.eliminar(id);
    return ok({ mensaje: m.eliminado });
  }, m.errorEliminar);

  return { GET, PUT: actualizar, PATCH: actualizar, DELETE };
}
