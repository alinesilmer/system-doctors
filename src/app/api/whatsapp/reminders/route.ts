import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getTurnos, marcarRecordatorioEnviado } from '@/lib/firestore/turnos';
import { getPaciente } from '@/lib/firestore/pacientes';
import {
  aFormatoInternacional, claveConversacion, enviarMensajeWhatsApp, esTelefonoValido,
} from '@/lib/whatsapp';
import { guardarMensajeSaliente } from '@/lib/firestore/mensajes';
import { manejarErrores, ok, validar } from '@/lib/api/respuestas';
import { fechaIso } from '@/lib/esquemas';
import { mananaIso } from '@/lib/fechas';
import type { Turno } from '@/lib/types';

const ESTADOS_A_RECORDAR: Turno['estado'][] = ['confirmado', 'pendiente'];

const esquemaPedido = z.object({ fecha: fechaIso.optional() });

function formatFecha(fecha: string, hora: string): string {
  const d = new Date(`${fecha}T00:00:00`);
  const dia = d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' });
  return `${dia} a las ${hora}`;
}

function armarMensaje(nombre: string, turno: Turno): string {
  return (
    `Hola ${nombre}! 👋 Te recordamos tu turno médico el ${formatFecha(turno.fecha, turno.horaInicio)}.\n\n` +
    `Por favor respondé con:\n` +
    `✅ *SI* para confirmar\n` +
    `❌ *NO* si necesitás cancelar o reprogramar\n\n` +
    `¡Muchas gracias!`
  );
}

interface Resultado {
  paciente: string;
  enviado: boolean;
  error?: string;
}

async function recordar(turno: Turno): Promise<Resultado> {
  const etiqueta = turno.pacienteNombre ?? turno.pacienteId;
  try {
    const paciente = await getPaciente(turno.pacienteId);
    if (!paciente?.telefono) return { paciente: etiqueta, enviado: false, error: 'Sin teléfono' };

    const tel = aFormatoInternacional(paciente.telefono);
    if (!esTelefonoValido(tel)) return { paciente: etiqueta, enviado: false, error: 'Teléfono inválido' };
    const mensaje = armarMensaje(paciente.nombre, turno);

    const enviado = await enviarMensajeWhatsApp(tel, mensaje);
    if (enviado) {
      await Promise.all([
        // Misma clave que usa el mensaje entrante, para que la respuesta caiga en este hilo.
        guardarMensajeSaliente(claveConversacion(tel), mensaje),
        marcarRecordatorioEnviado(turno),
      ]);
    }

    return { paciente: `${paciente.apellido}, ${paciente.nombre}`, enviado };
  } catch (e) {
    console.error('[reminders]', turno.id, e);
    return { paciente: etiqueta, enviado: false, error: 'No se pudo procesar el turno' };
  }
}

export const POST = manejarErrores(async (req: NextRequest) => {
  // El cuerpo es opcional: sin él se recuerdan los turnos de mañana.
  const cuerpo = await req.json().catch(() => ({}));
  const { fecha } = validar(esquemaPedido, cuerpo ?? {});
  const fechaObjetivo = fecha ?? mananaIso();

  const turnos = await getTurnos(fechaObjetivo, fechaObjetivo);
  const delDia = turnos.filter((t) => ESTADOS_A_RECORDAR.includes(t.estado));
  // Apretar el botón dos veces no debe escribirle dos veces al mismo paciente.
  const aRecordar = delDia.filter((t) => t.recordatorioPara !== t.fecha);

  const resultados = await Promise.all(aRecordar.map(recordar));

  return ok({
    fecha: fechaObjetivo,
    total: aRecordar.length,
    enviados: resultados.filter((r) => r.enviado).length,
    yaRecordados: delDia.length - aRecordar.length,
    resultados,
  });
}, 'Error al enviar los recordatorios');
