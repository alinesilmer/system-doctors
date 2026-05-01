import { NextRequest, NextResponse } from 'next/server';
import { getTurnos } from '@/lib/firestore/turnos';
import { getPaciente } from '@/lib/firestore/pacientes';
import { enviarMensajeWhatsApp } from '@/lib/whatsapp';
import { guardarMensajeSaliente } from '@/lib/firestore/mensajes';

function manana(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function formatFecha(fecha: string, hora: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return `${d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })} a las ${hora}`;
}

function armarTelefono(tel: string): string {
  const digits = tel.replace(/\D/g, '');
  if (digits.startsWith('54')) return `+${digits}`;
  if (digits.startsWith('0')) return `+54${digits.slice(1)}`;
  if (digits.length === 10) return `+54${digits}`;
  return `+54${digits}`;
}

export async function POST(req: NextRequest) {
  try {
    const { fecha } = await req.json().catch(() => ({})) as { fecha?: string };
    const fechaObjetivo = fecha ?? manana();

    const turnos = await getTurnos(fechaObjetivo, fechaObjetivo);
    const confirmados = turnos.filter((t) => t.estado === 'confirmado' || t.estado === 'pendiente');

    const resultados: { paciente: string; enviado: boolean; error?: string }[] = [];

    for (const turno of confirmados) {
      try {
        const paciente = await getPaciente(turno.pacienteId);
        if (!paciente?.telefono) {
          resultados.push({ paciente: turno.pacienteNombre ?? turno.pacienteId, enviado: false, error: 'Sin teléfono' });
          continue;
        }

        const tel = armarTelefono(paciente.telefono);
        const mensaje =
          `Hola ${paciente.nombre}! 👋 Te recordamos tu turno médico el ${formatFecha(turno.fecha, turno.horaInicio)}.\n\n` +
          `Por favor respondé con:\n` +
          `✅ *SI* para confirmar\n` +
          `❌ *NO* si necesitás cancelar o reprogramar\n\n` +
          `¡Muchas gracias!`;

        const enviado = await enviarMensajeWhatsApp(tel, mensaje);
        if (enviado) {
          await guardarMensajeSaliente(tel, mensaje);
        }
        resultados.push({ paciente: `${paciente.apellido}, ${paciente.nombre}`, enviado });
      } catch (e) {
        resultados.push({ paciente: turno.pacienteNombre ?? turno.pacienteId, enviado: false, error: (e as Error).message });
      }
    }

    return NextResponse.json({
      fecha: fechaObjetivo,
      total: confirmados.length,
      enviados: resultados.filter((r) => r.enviado).length,
      resultados,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
