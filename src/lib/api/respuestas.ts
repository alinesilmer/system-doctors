import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { MODO_DEMO } from '@/lib/demo/modo';

/**
 * Error de negocio cuyo mensaje es seguro mostrarle al cliente.
 * Cualquier otra excepción se reporta como 500 genérico para no filtrar
 * detalles internos (stack, nombres de colección, respuestas de terceros).
 */
export class ErrorDeApi extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'ErrorDeApi';
  }
}

export const noEncontrado = (mensaje: string) => new ErrorDeApi(404, mensaje);
export const datosInvalidos = (mensaje: string) => new ErrorDeApi(400, mensaje);
export const conflicto = (mensaje: string) => new ErrorDeApi(409, mensaje);
export const noAutorizado = (mensaje = 'Unauthorized') => new ErrorDeApi(401, mensaje);

export function ok<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

/**
 * Envuelve el handler de una ruta: traduce `ErrorDeApi` a su status y deja
 * cualquier fallo inesperado como 500 sin detalle, registrándolo en el servidor.
 */
export function manejarErrores<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
  mensajeGenerico = 'Ocurrió un error procesando la solicitud',
) {
  return async (...args: Args): Promise<Response> => {
    // En modo demo la API real queda cerrada: las pantallas usan datos ficticios
    // del navegador y nadie de afuera puede leer ni escribir en la base.
    if (MODO_DEMO) {
      return NextResponse.json({ error: 'API desactivada: la app está en modo demo' }, { status: 503 });
    }
    try {
      return await handler(...args);
    } catch (e) {
      if (e instanceof ErrorDeApi) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      console.error('[api]', e);
      return NextResponse.json({ error: mensajeGenerico }, { status: 500 });
    }
  };
}

/** Cuerpo JSON de la petición; un cuerpo ausente o mal formado es un 400, no un 500. */
export async function leerJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw datosInvalidos('El cuerpo de la solicitud no es JSON válido');
  }
}

/**
 * Valida `datos` contra un esquema de zod y devuelve sólo los campos declarados:
 * lo que el esquema no conoce se descarta, así el cliente no puede escribir
 * campos arbitrarios en la base.
 */
export function validar<T>(esquema: z.ZodType<T>, datos: unknown): T {
  const resultado = esquema.safeParse(datos);
  if (resultado.success) return resultado.data;

  const [problema] = resultado.error.issues;
  const campo = problema.path.join('.');
  // Los mensajes propios del esquema ya están pensados para el usuario; los
  // genéricos de zod no, así que se reemplazan por uno neutro.
  const esMensajePropio = problema.code === 'custom' || !/^(Invalid|Too|Unrecognized)/.test(problema.message);
  throw datosInvalidos(esMensajePropio ? problema.message : `Dato inválido${campo ? `: ${campo}` : ''}`);
}
