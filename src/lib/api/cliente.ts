/** Cliente HTTP del navegador para la API propia. No importar desde rutas del servidor. */

import { MODO_DEMO } from '@/lib/demo/modo';

export class ErrorDePeticion extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'ErrorDePeticion';
  }
}

interface Opciones {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Se envía como JSON. */
  cuerpo?: unknown;
  /** Mensaje a mostrar cuando el servidor no informa uno propio. */
  mensajeError?: string;
}

/**
 * Llama a la API y devuelve el JSON de la respuesta. Cualquier status que no sea
 * 2xx se convierte en una excepción con el mensaje del servidor, para que ningún
 * llamador pueda tomar un fallo por un éxito.
 */
export function pedirApi<T = unknown>(url: string, opciones: Opciones = {}): Promise<T> {
  const esLectura = (opciones.metodo ?? 'GET') === 'GET';
  // Una escritura puede cambiar cualquier listado: lo guardado deja de ser confiable.
  if (!esLectura) return enviar<T>(url, opciones).finally(vaciarCache);

  // Dos partes de la pantalla que piden lo mismo a la vez (el dock y la página,
  // por ejemplo) comparten una única petición en lugar de duplicarla.
  const enVuelo = lecturasEnVuelo.get(url);
  if (enVuelo) return enVuelo as Promise<T>;

  const peticion = enviar<T>(url, opciones)
    .then((datos) => { ultimasLecturas.set(url, datos); return datos; })
    .finally(() => lecturasEnVuelo.delete(url));
  lecturasEnVuelo.set(url, peticion);
  return peticion;
}

const lecturasEnVuelo = new Map<string, Promise<unknown>>();

// Última respuesta de cada lectura, sólo en memoria de esta pestaña. Permite
// pintar una pantalla ya visitada sin esperar a la red; el dato se vuelve a
// pedir igual, así que a lo sumo se ve viejo un instante.
const ultimasLecturas = new Map<string, unknown>();

export function leerCache<T>(url: string): T | undefined {
  return ultimasLecturas.get(url) as T | undefined;
}

export function vaciarCache(): void {
  ultimasLecturas.clear();
}

async function enviar<T>(
  url: string,
  { metodo = 'GET', cuerpo, mensajeError = 'Ocurrió un error. Intentá de nuevo.' }: Opciones,
): Promise<T> {
  // Modo demo: responde el navegador con datos ficticios; no sale nada a la red.
  // El import es dinámico para que esos datos no viajen con la app real.
  if (MODO_DEMO) {
    const { responderDemo } = await import('@/lib/demo/servidor');
    return responderDemo<T>(metodo, url, cuerpo);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: metodo,
      ...(cuerpo !== undefined && {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      }),
    });
  } catch {
    throw new ErrorDePeticion(0, 'No se pudo conectar con el servidor');
  }

  const data = await res.json().catch(() => null) as { error?: string } | null;
  if (!res.ok) throw new ErrorDePeticion(res.status, data?.error ?? mensajeError);
  return data as T;
}
