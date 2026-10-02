import { NextRequest } from 'next/server';
import { getConversaciones, getMensajes, marcarLeidos } from '@/lib/firestore/mensajes';
import { datosInvalidos, manejarErrores, ok } from '@/lib/api/respuestas';
import { esTelefonoValido } from '@/lib/whatsapp';

export const GET = manejarErrores(async (req: NextRequest) => {
  const telefono = req.nextUrl.searchParams.get('telefono');

  if (telefono) {
    if (!esTelefonoValido(telefono)) throw datosInvalidos('Teléfono inválido');
    const mensajes = await getMensajes(telefono);
    await marcarLeidos(telefono);
    return ok({ items: mensajes });
  }

  return ok({ items: await getConversaciones() });
}, 'Error al obtener las conversaciones');
