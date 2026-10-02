import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { noAutorizado } from './respuestas';

function comparacionSegura(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Endpoints que sólo puede invocar n8n (máquina a máquina) mediante la clave
 * compartida. Falla cerrado: sin clave configurada nadie entra.
 */
export function exigirClaveInterna(req: NextRequest): void {
  const esperada = process.env.MEDISYSTEM_INTERNAL_KEY;
  const recibida = req.headers.get('x-internal-key');

  if (!esperada || !recibida || !comparacionSegura(recibida, esperada)) {
    throw noAutorizado();
  }
}
