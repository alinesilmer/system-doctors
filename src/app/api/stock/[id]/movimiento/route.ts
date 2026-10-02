import { NextRequest } from 'next/server';
import { registrarMovimiento, ItemInexistenteError, StockInsuficienteError } from '@/lib/firestore/stock';
import { datosInvalidos, leerJson, manejarErrores, noEncontrado, ok, validar } from '@/lib/api/respuestas';
import { esquemaMovimientoStock } from '@/lib/esquemas';

type Contexto = { params: Promise<{ id: string }> };

export const POST = manejarErrores(async (req: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const { tipo, cantidad, motivo } = validar(esquemaMovimientoStock, await leerJson(req));

  try {
    const resultado = await registrarMovimiento(id, tipo, cantidad, motivo);
    return ok({ mensaje: 'Movimiento registrado correctamente', ...resultado });
  } catch (e) {
    if (e instanceof ItemInexistenteError) throw noEncontrado('Item no encontrado');
    if (e instanceof StockInsuficienteError) throw datosInvalidos(e.message);
    throw e;
  }
}, 'Error al registrar movimiento');
