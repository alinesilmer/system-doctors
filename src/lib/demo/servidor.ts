import { ErrorDePeticion } from '@/lib/api/cliente';
import { hoyIso, mananaIso } from '@/lib/fechas';
import type { FormularioInvitacion, MovimientoStock, Paciente } from '@/lib/types';
import { sembrar, type BaseDemo } from './datos';

/**
 * La API del modo demo: responde en el navegador lo mismo que responderían las
 * rutas de `app/api`, sobre datos ficticios en memoria. Lo que se crea o se
 * edita dura hasta recargar la página.
 */

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Entidad = { id: string } & Record<string, unknown>;
type Cuerpo = Record<string, unknown>;

let base: BaseDemo | null = null;
const datos = () => (base ??= sembrar());
const coleccion = (clave: keyof BaseDemo) => datos()[clave] as unknown as Entidad[];

const ahora = () => new Date().toISOString();
const nuevoId = () => crypto.randomUUID().slice(0, 12);
const pausa = () => new Promise((listo) => setTimeout(listo, 150));

const noEncontrado = (mensaje: string) => new ErrorDePeticion(404, mensaje);
const datosInvalidos = (mensaje: string) => new ErrorDePeticion(400, mensaje);
const conflicto = (mensaje: string) => new ErrorDePeticion(409, mensaje);

// ─── Recursos con CRUD estándar (espejo de `lib/recursos.ts`) ────────────────

interface RecursoDemo {
  clave: keyof BaseDemo;
  etiqueta: string;
  femenino?: boolean;
  orden: string;
  descendente?: boolean;
  porDefecto: Cuerpo;
}

const RECURSOS: Record<string, RecursoDemo> = {
  pacientes: { clave: 'pacientes', etiqueta: 'Paciente', orden: 'apellido', porDefecto: { fechaNacimiento: '', sexo: 'no_especificado', telefono: '' } },
  turnos: { clave: 'turnos', etiqueta: 'Turno', orden: 'fecha', porDefecto: { estado: 'pendiente', horaFin: '', motivo: '' } },
  stock: { clave: 'stock', etiqueta: 'Item', orden: 'nombre', porDefecto: { cantidad: 0, cantidadMinima: 0, unidad: 'unidades' } },
  practicas: { clave: 'practicas', etiqueta: 'Práctica', femenino: true, orden: 'nombre', porDefecto: { activa: true } },
  tratamientos: { clave: 'tratamientos', etiqueta: 'Tratamiento', orden: 'nombre', porDefecto: { practicas: [], precioTotal: 0, activo: true } },
  presupuestos: { clave: 'presupuestos', etiqueta: 'Presupuesto', orden: 'creadoEn', descendente: true, porDefecto: { subtotal: 0, descuento: 0, total: 0, estado: 'borrador' } },
  documentos: { clave: 'documentos', etiqueta: 'Documento', orden: 'titulo', porDefecto: { activo: true } },
  medicamentos: { clave: 'medicamentos', etiqueta: 'Medicamento', orden: 'nombre', porDefecto: { forma: 'otro', requiereReceta: false } },
};

function ordenar(items: Entidad[], campo: string, descendente = false): Entidad[] {
  const sentido = descendente ? -1 : 1;
  return [...items].sort((a, b) => sentido * String(a[campo] ?? '').localeCompare(String(b[campo] ?? ''), 'es'));
}

function crud(recurso: RecursoDemo, metodo: Metodo, id: string | undefined, cuerpo: Cuerpo, filtro: URLSearchParams) {
  const items = coleccion(recurso.clave);
  const o = recurso.femenino ? 'a' : 'o';
  const inexistente = () => noEncontrado(`${recurso.etiqueta} no encontrad${o}`);

  if (!id) {
    if (metodo === 'GET') {
      let lista = ordenar(items, recurso.orden, recurso.descendente);
      if (recurso.clave === 'turnos') {
        // La agenda pide sólo un rango de fechas, y dentro del día va por hora.
        const desde = filtro.get('desde');
        const hasta = filtro.get('hasta');
        lista = lista
          .filter((t) => (!desde || String(t.fecha) >= desde) && (!hasta || String(t.fecha) <= hasta))
          .sort((a, b) => `${a.fecha} ${a.horaInicio}`.localeCompare(`${b.fecha} ${b.horaInicio}`));
      }
      return { items: lista, total: lista.length };
    }
    if (metodo === 'POST') {
      const nuevo = { ...recurso.porDefecto, ...cuerpo, id: nuevoId(), creadoEn: ahora(), actualizadoEn: ahora() };
      items.push(nuevo);
      return { data: { id: nuevo.id }, mensaje: `${recurso.etiqueta} cread${o} correctamente` };
    }
    throw new ErrorDePeticion(405, 'Método no permitido');
  }

  const indice = items.findIndex((x) => x.id === id);
  if (metodo === 'DELETE') {
    if (indice >= 0) items.splice(indice, 1);
    return { mensaje: `${recurso.etiqueta} eliminad${o} correctamente` };
  }
  if (indice < 0) throw inexistente();
  if (metodo === 'GET') return { data: items[indice] };

  items[indice] = { ...items[indice], ...cuerpo, id, actualizadoEn: ahora() };
  return { mensaje: `${recurso.etiqueta} actualizad${o} correctamente` };
}

// ─── Rutas con lógica propia ─────────────────────────────────────────────────

function historiaClinica(metodo: Metodo, pacienteId: string, cuerpo: Cuerpo) {
  const { historias, pacientes } = datos();
  if (metodo === 'GET') {
    return { items: historias.filter((h) => h.pacienteId === pacienteId).sort((a, b) => b.fecha.localeCompare(a.fecha)) };
  }
  if (!pacientes.some((p) => p.id === pacienteId)) throw noEncontrado('Paciente no encontrado');
  const id = nuevoId();
  coleccion('historias').push({ fecha: hoyIso(), ...cuerpo, id, pacienteId, creadoEn: ahora() });
  return { data: { id }, mensaje: 'Entrada creada correctamente' };
}

function movimientoDeStock(itemId: string, cuerpo: Cuerpo) {
  const item = datos().stock.find((i) => i.id === itemId);
  if (!item) throw noEncontrado('Item no encontrado');

  const tipo = cuerpo.tipo as MovimientoStock['tipo'];
  const cantidad = Number(cuerpo.cantidad);
  if (!Number.isFinite(cantidad) || cantidad < 0 || (tipo !== 'ajuste' && cantidad === 0)) {
    throw datosInvalidos('La cantidad debe ser mayor a cero');
  }

  const cantidadAnterior = item.cantidad;
  const cantidadNueva = tipo === 'entrada' ? cantidadAnterior + cantidad : tipo === 'salida' ? cantidadAnterior - cantidad : cantidad;
  if (cantidadNueva < 0) throw datosInvalidos(`Stock insuficiente: hay ${cantidadAnterior} y se pidieron ${cantidad}`);

  item.cantidad = cantidadNueva;
  item.actualizadoEn = ahora();
  datos().movimientos.unshift({
    id: nuevoId(), itemId, itemNombre: item.nombre, tipo, cantidad, cantidadAnterior, cantidadNueva,
    motivo: String(cuerpo.motivo ?? ''), creadoEn: ahora(),
  });
  return { mensaje: 'Movimiento registrado correctamente', cantidadAnterior, cantidadNueva };
}

function invitaciones(metodo: Metodo, token: string | undefined, cuerpo: Cuerpo) {
  const lista = datos().invitaciones;

  if (!token) {
    if (metodo === 'GET') return { items: [...lista].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)) };
    const nueva: FormularioInvitacion = { id: nuevoId(), token: crypto.randomUUID(), estado: 'pendiente', creadoEn: ahora() };
    lista.push(nueva);
    return { data: { id: nueva.id, token: nueva.token } };
  }

  const inv = lista.find((i) => i.token === token);
  if (!inv) throw noEncontrado('Enlace inválido o expirado');
  if (metodo === 'GET') return { data: { estado: inv.estado } };

  if (metodo === 'POST') {
    if (inv.estado !== 'pendiente') throw conflicto('Este formulario ya fue completado');
    inv.estado = 'completado';
    inv.completadoEn = ahora();
    inv.datosPaciente = cuerpo as unknown as FormularioInvitacion['datosPaciente'];
    return { mensaje: 'Datos recibidos correctamente. El médico revisará tu información.' };
  }

  if (inv.estado === 'aprobado') throw conflicto('Esta invitación ya fue aprobada');
  if (!inv.datosPaciente) throw datosInvalidos('No hay datos para aprobar');
  const paciente: Paciente = { ...inv.datosPaciente, id: nuevoId(), creadoEn: ahora(), actualizadoEn: ahora() };
  datos().pacientes.push(paciente);
  inv.estado = 'aprobado';
  return { data: { pacienteId: paciente.id }, mensaje: 'Paciente creado correctamente' };
}

function whatsapp(accion: string | undefined, metodo: Metodo, cuerpo: Cuerpo, filtro: URLSearchParams) {
  const { conversaciones, mensajes, turnos } = datos();

  if (accion === 'conversaciones' && metodo === 'GET') {
    const telefono = filtro.get('telefono');
    if (!telefono) return { items: [...conversaciones].sort((a, b) => b.ultimaActividad.localeCompare(a.ultimaActividad)) };

    const conversacion = conversaciones.find((c) => c.telefono === telefono);
    if (conversacion) conversacion.noLeidos = 0;
    return { items: mensajes.filter((m) => m.telefono === telefono).sort((a, b) => a.creadoEn.localeCompare(b.creadoEn)) };
  }

  if (accion === 'send' && metodo === 'POST') {
    const telefono = String(cuerpo.telefono ?? '');
    const texto = String(cuerpo.mensaje ?? '').trim();
    if (!telefono || !texto) throw datosInvalidos('telefono y mensaje son requeridos');

    for (const m of mensajes) if (m.telefono === telefono) m.respondido = true;
    mensajes.push({ id: nuevoId(), telefono, cuerpo: texto, direccion: 'saliente', respondido: true, creadoEn: ahora() });
    const conversacion = conversaciones.find((c) => c.telefono === telefono);
    if (conversacion) Object.assign(conversacion, { ultimoMensaje: texto, ultimaActividad: ahora() });
    return { ok: true };
  }

  if (accion === 'reminders' && metodo === 'POST') {
    const fecha = mananaIso();
    const deManana = turnos.filter((t) => t.fecha === fecha && t.estado !== 'cancelado');
    const pendientes = deManana.filter((t) => t.recordatorioPara !== fecha);
    for (const t of pendientes) t.recordatorioPara = fecha;
    return {
      fecha,
      total: deManana.length,
      enviados: pendientes.length,
      yaRecordados: deManana.length - pendientes.length,
      resultados: pendientes.map((t) => ({ paciente: t.pacienteNombre ?? 'Paciente', enviado: true })),
    };
  }

  throw noEncontrado('Ruta no disponible en el modo demo');
}

// ─── IA: respuestas de muestra, sin llamar a ningún modelo ───────────────────

function consultaIA(cuerpo: Cuerpo) {
  const mensajes = (cuerpo.mensajes as { content: string }[] | undefined) ?? [];
  const pedido = mensajes.at(-1)?.content.trim() ?? '';
  const esPregunta = pedido.endsWith('?') && pedido.length < 120;

  if (esPregunta) {
    return {
      respuesta: 'Esta es una respuesta de muestra: en el modo demo el asistente no consulta a la IA. Al conectarla, acá vas a ver la respuesta clínica a tu pregunta.',
      esNota: false,
    };
  }

  return {
    respuesta: [
      `**Motivo de consulta:** ${pedido.slice(0, 160) || 'No referido'}`,
      '**Anamnesis:** Nota de muestra generada en el modo demo, sin intervención de la IA.',
      '**Examen físico:** No referido',
      '**Diagnóstico presuntivo:** A completar por el profesional.',
      '**Plan y tratamiento:** Control en consultorio y seguimiento según evolución.',
      '[NOTA_LISTA]',
    ].join('\n'),
    esNota: true,
  };
}

function contenidoIA(cuerpo: Cuerpo) {
  const tema = String(cuerpo.topic ?? 'tu salud');
  const especialidad = String(cuerpo.specialty ?? 'medicina');
  const etiqueta = (texto: string) => `#${texto.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '')}`;

  return {
    data: {
      title: `${tema}: lo que conviene saber`,
      caption_variants: [
        `Hablemos de ${tema}. Un control a tiempo hace la diferencia: consultá con tu médico. (Texto de muestra del modo demo.)`,
        `¿Dudas sobre ${tema}? En el consultorio las resolvemos juntos. Pedí tu turno.`,
        `${tema}: tres cosas simples que podés hacer hoy por tu salud.`,
      ],
      short_caption: `${tema}: informate y consultá.`,
      story_slides: [`¿Sabías esto sobre ${tema}?`, 'Señales para prestar atención', 'Cuándo consultar', 'Pedí tu turno'],
      whatsapp_versions: {
        short: `Recordá: ${tema} se cuida con controles periódicos.`,
        medium: `Hola, te compartimos información sobre ${tema}. Si tenés dudas, escribinos y coordinamos una consulta.`,
        reminder: `Te recordamos tu control. Si querés hablar sobre ${tema}, lo vemos en la consulta.`,
      },
      hashtags: [etiqueta(tema), etiqueta(especialidad), '#salud', '#prevencion'],
      cta: 'Pedí tu turno',
      image_prompt: `Ilustración cálida y sobria sobre ${tema}, estilo editorial, sin texto.`,
      compliance_notes: ['Contenido de muestra del modo demo.', 'No reemplaza la consulta médica.'],
    },
  };
}

// ─── Entrada ─────────────────────────────────────────────────────────────────

function resolver(metodo: Metodo, url: string, cuerpo: Cuerpo): unknown {
  const { pathname, searchParams } = new URL(url, 'http://demo');
  const [recurso, a, b] = pathname.replace(/^\/api\//, '').split('/').map(decodeURIComponent);

  if (recurso === 'pacientes' && a === 'cantidad') return { data: { cantidad: datos().pacientes.length } };
  if (recurso === 'pacientes' && b === 'historia-clinica') return historiaClinica(metodo, a, cuerpo);
  if (recurso === 'stock' && a === 'movimientos') return { items: datos().movimientos };
  if (recurso === 'stock' && b === 'movimiento') return movimientoDeStock(a, cuerpo);
  if (recurso === 'invitaciones') return invitaciones(metodo, a, cuerpo);
  if (recurso === 'whatsapp') return whatsapp(a, metodo, cuerpo, searchParams);
  if (recurso === 'ai' && a === 'consulta') return consultaIA(cuerpo);
  if (recurso === 'contenido' && a === 'generar') return contenidoIA(cuerpo);
  if (RECURSOS[recurso]) return crud(RECURSOS[recurso], metodo, a, cuerpo, searchParams);

  throw noEncontrado('Ruta no disponible en el modo demo');
}

export async function responderDemo<T>(metodo: Metodo, url: string, cuerpo?: unknown): Promise<T> {
  await pausa();
  // Copia: lo que recibe la pantalla no debe ser el mismo objeto que se guarda.
  return structuredClone(resolver(metodo, url, (cuerpo ?? {}) as Cuerpo)) as T;
}
