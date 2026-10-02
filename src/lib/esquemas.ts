import { z } from 'zod';

/**
 * Esquemas de entrada de la API. Son la única definición de qué campos acepta
 * cada entidad: todo lo que no figure acá se descarta antes de llegar a Firestore.
 * No llevan valores por defecto a propósito, para que `.partial()` sirva tal cual
 * en las actualizaciones (un default pisaría los campos que el cliente no mandó).
 */

const CORTO = 200;
const LARGO = 5_000;
const DOCUMENTO = 100_000;
const MAX_ITEMS = 200;

const texto = (max = CORTO) => z.string().trim().max(max);

const requerido = (etiqueta: string, max = CORTO) =>
  z.string({ error: `${etiqueta} es requerido` }).trim().min(1, `${etiqueta} es requerido`).max(max);

const cantidad = (etiqueta: string) =>
  z.coerce
    .number({ error: `${etiqueta} debe ser un número` })
    .min(0, `${etiqueta} no puede ser menor a cero`)
    .max(1e12);

const lista = (max = CORTO) => z.array(texto(max)).max(MAX_ITEMS);

export const fechaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato AAAA-MM-DD');
const fechaOVacia = z.union([z.literal(''), fechaIso]);
const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener formato HH:MM');

// ─── Pacientes ───────────────────────────────────────────────────────────────

const documentoPaciente = z.object({
  id: requerido('El id del documento'),
  nombre: requerido('El nombre del documento', 300),
  // Se renderiza como enlace: sólo https, nunca `javascript:` ni `data:`.
  url: z.string().max(2_000).regex(/^https:\/\//, 'La URL del documento no es válida'),
  tipo: texto(),
  tamanio: cantidad('El tamaño').optional(),
  subidoEn: texto(40),
});

/** Lo que puede cargar el propio paciente desde el enlace público de registro. */
export const esquemaRegistroPaciente = z.object({
  nombre: requerido('El nombre'),
  apellido: requerido('El apellido'),
  dni: requerido('El DNI', 20),
  fechaNacimiento: fechaOVacia,
  sexo: z.enum(['masculino', 'femenino', 'otro', 'no_especificado']),
  telefono: texto(40),
  email: texto().optional(),
  direccion: texto(300).optional(),
  obraSocial: texto().optional(),
  nroAfiliado: texto(60).optional(),
  grupoSanguineo: texto(10).optional(),
  alergias: texto(LARGO).optional(),
  notas: texto(LARGO).optional(),
});

export const esquemaPaciente = esquemaRegistroPaciente.extend({
  antFamiliares: z.object({ padre: lista(), madre: lista(), hermanos: lista() }).optional(),
  antPersonales: z.object({ cirugias: lista(), internaciones: lista() }).optional(),
  habitos: z.object({ items: lista() }).optional(),
  documentos: z.array(documentoPaciente).max(MAX_ITEMS).optional(),
});

export const esquemaEntradaHistoriaClinica = z.object({
  fecha: fechaIso,
  tipo: z.enum(['consulta', 'estudio', 'receta', 'nota', 'derivacion'], { error: 'El tipo de entrada no es válido' }),
  titulo: requerido('El título', 300),
  contenido: requerido('El contenido', DOCUMENTO),
});

// ─── Turnos ──────────────────────────────────────────────────────────────────

export const esquemaTurno = z.object({
  pacienteId: requerido('El paciente'),
  pacienteNombre: texto(300).optional(),
  fecha: fechaIso,
  horaInicio: hora,
  horaFin: z.union([z.literal(''), hora]),
  motivo: texto(500),
  estado: z.enum(['pendiente', 'confirmado', 'cancelado', 'completado', 'no_asistio']),
  notas: texto(LARGO).optional(),
});

// ─── Stock ───────────────────────────────────────────────────────────────────

export const esquemaItemStock = z.object({
  nombre: requerido('El nombre'),
  descripcion: texto(LARGO).optional(),
  categoria: requerido('La categoría'),
  cantidad: cantidad('La cantidad'),
  cantidadMinima: cantidad('La cantidad mínima'),
  unidad: texto(40),
  proveedor: texto().optional(),
  codigoInterno: texto(60).optional(),
  lote: texto(60).optional(),
  fechaVencimiento: fechaOVacia.optional(),
  ubicacion: texto().optional(),
});

export const esquemaMovimientoStock = z.object({
  tipo: z.enum(['entrada', 'salida', 'ajuste'], { error: 'El tipo de movimiento no es válido' }),
  cantidad: cantidad('La cantidad'),
  motivo: texto(500).optional(),
}).refine((m) => m.tipo === 'ajuste' || m.cantidad > 0, {
  message: 'La cantidad debe ser mayor a cero',
  path: ['cantidad'],
});

// ─── Prácticas, tratamientos y presupuestos ──────────────────────────────────

export const esquemaPractica = z.object({
  nombre: requerido('El nombre'),
  descripcion: texto(LARGO).optional(),
  precio: cantidad('El precio'),
  duracionMinutos: cantidad('La duración').optional(),
  categoria: texto().optional(),
  activa: z.boolean(),
});

const itemTratamiento = z.object({
  practicaId: requerido('La práctica'),
  practicaNombre: texto(),
  cantidad: cantidad('La cantidad'),
  precioUnitario: cantidad('El precio'),
  subtotal: cantidad('El subtotal'),
});

export const esquemaTratamiento = z.object({
  nombre: requerido('El nombre'),
  descripcion: texto(LARGO).optional(),
  practicas: z.array(itemTratamiento).max(MAX_ITEMS),
  precioTotal: cantidad('El precio total'),
  activo: z.boolean(),
});

const itemPresupuesto = z.object({
  tipo: z.enum(['practica', 'tratamiento', 'examen_externo']),
  referenciaId: texto().optional(),
  nombre: requerido('El nombre del ítem', 300),
  descripcion: texto(LARGO).optional(),
  cantidad: cantidad('La cantidad'),
  precioUnitario: cantidad('El precio'),
  subtotal: cantidad('El subtotal'),
  profesional: texto().optional(),
  institucion: texto().optional(),
});

export const esquemaPresupuesto = z.object({
  numero: texto(40).optional(),
  pacienteId: texto().optional(),
  pacienteNombre: texto(300).optional(),
  items: z.array(itemPresupuesto).min(1, 'El presupuesto debe tener al menos un ítem').max(MAX_ITEMS),
  subtotal: cantidad('El subtotal'),
  descuento: cantidad('El descuento'),
  total: cantidad('El total'),
  validoHasta: fechaOVacia.optional(),
  estado: z.enum(['borrador', 'enviado', 'aceptado', 'rechazado', 'vencido']),
  notas: texto(LARGO).optional(),
});

// ─── Documentos y medicamentos ───────────────────────────────────────────────

export const esquemaDocumento = z.object({
  titulo: requerido('El título', 300),
  tipo: z.enum(['consentimiento', 'informacion', 'protocolo', 'formulario', 'otro'], { error: 'El tipo de documento no es válido' }),
  descripcion: texto(LARGO).optional(),
  contenido: requerido('El contenido', DOCUMENTO),
  etiquetas: lista(60).optional(),
  activo: z.boolean(),
});

export const esquemaMedicamento = z.object({
  nombre: requerido('El nombre'),
  principioActivo: requerido('El principio activo'),
  laboratorio: texto().optional(),
  presentacion: requerido('La presentación'),
  forma: z.enum([
    'comprimido', 'capsula', 'jarabe', 'inyectable', 'crema',
    'gotas', 'supositorio', 'parche', 'inhalador', 'otro',
  ]),
  categoria: texto().optional(),
  requiereReceta: z.boolean(),
  precioSugerido: cantidad('El precio sugerido').optional(),
  notas: texto(LARGO).optional(),
  disponibleEn: lista().optional(),
});
