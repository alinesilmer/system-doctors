export type EstadoTurno = 'pendiente' | 'confirmado' | 'cancelado' | 'completado' | 'no_asistio';
export type SexoBiologico = 'masculino' | 'femenino' | 'otro' | 'no_especificado';
export type TipoMovimientoStock = 'entrada' | 'salida' | 'ajuste';

// --- Obras Sociales / Health Insurance ---
export interface InsuranceProvider {
  id: string;
  nombre: string;
  codigoObraSocial?: string;
  activa: boolean;
  creadoEn: string;
}

export interface PricingItem {
  codigo: string;
  descripcion: string;
  precio: number;
  unidad?: string;
}

export interface PricingAgreement {
  id: string;
  providerId: string;
  vigenciaDesde: string;
  vigenciaHasta?: string;
  descripcion?: string;
  items: PricingItem[];
  creadoEn: string;
}

// --- Patient Enhancements ---
export interface AntFamiliares {
  padre: string[];
  madre: string[];
  hermanos: string[];
}

export interface AntPersonales {
  cirugias: string[];
  internaciones: string[];
}

export interface Habitos {
  items: string[];
}

export interface DocumentoPaciente {
  id: string;
  nombre: string;
  url: string;
  tipo: string;
  tamanio?: number;
  subidoEn: string;
}

export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  sexo: SexoBiologico;
  telefono: string;
  email?: string;
  direccion?: string;
  obraSocial?: string;
  nroAfiliado?: string;
  grupoSanguineo?: string;
  alergias?: string;
  notas?: string;
  antFamiliares?: AntFamiliares;
  antPersonales?: AntPersonales;
  habitos?: Habitos;
  documentos?: DocumentoPaciente[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface EntradaHistoriaClinica {
  id: string;
  pacienteId: string;
  fecha: string;
  tipo: 'consulta' | 'estudio' | 'receta' | 'nota' | 'derivacion';
  titulo: string;
  contenido: string;
  archivos?: string[];
  creadoPor?: string;
  creadoEn: string;
}

export interface Turno {
  id: string;
  pacienteId: string;
  pacienteNombre?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  estado: EstadoTurno;
  notas?: string;
  /** Fecha del turno para la que ya se envió el recordatorio por WhatsApp. */
  recordatorioPara?: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ItemStock {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  cantidad: number;
  cantidadMinima: number;
  unidad: string;
  proveedor?: string;
  codigoInterno?: string;
  lote?: string;
  fechaVencimiento?: string;
  ubicacion?: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface MovimientoStock {
  id: string;
  itemId: string;
  itemNombre?: string;
  tipo: TipoMovimientoStock;
  cantidad: number;
  cantidadAnterior: number;
  cantidadNueva: number;
  motivo?: string;
  creadoEn: string;
}

export type ClasificacionMensaje =
  | 'urgencia'
  | 'consulta_medica'
  | 'receta'
  | 'turno'
  | 'confirmacion'
  | 'informacion'
  | 'secretaria'
  | 'otro';

export type PrioridadMensaje = 'urgente' | 'normal' | 'baja';
export type DerivacionMensaje = 'medico' | 'secretaria' | 'automatico';

export interface MensajeWA {
  id: string;
  telefono: string;
  nombre?: string;
  cuerpo: string;
  direccion: 'entrante' | 'saliente';
  clasificacion?: ClasificacionMensaje;
  urgencia?: 'alta' | 'media' | 'baja';
  derivarA?: DerivacionMensaje;
  respuestaSugerida?: string;
  respuestaAutomatica?: string;
  resumen?: string;
  respondido: boolean;
  creadoEn: string;
}

export interface ConversacionWA {
  id: string;
  telefono: string;
  nombre?: string;
  pacienteId?: string;
  ultimoMensaje: string;
  ultimaActividad: string;
  noLeidos: number;
  prioridad: PrioridadMensaje;
  estado: 'activo' | 'cerrado';
  creadoEn: string;
}

export interface FormularioInvitacion {
  id: string;
  token: string;
  estado: 'pendiente' | 'completado' | 'aprobado';
  creadoEn: string;
  completadoEn?: string;
  datosPaciente?: Omit<Paciente, 'id' | 'creadoEn' | 'actualizadoEn'>;
}

// --- Medicamentos ---
export type FormaFarmaceutica =
  | 'comprimido' | 'capsula' | 'jarabe' | 'inyectable'
  | 'crema' | 'gotas' | 'supositorio' | 'parche' | 'inhalador' | 'otro';

export interface Medicamento {
  id: string;
  nombre: string;
  principioActivo: string;
  laboratorio?: string;
  presentacion: string;
  forma: FormaFarmaceutica;
  categoria?: string;
  requiereReceta: boolean;
  precioSugerido?: number;
  notas?: string;
  disponibleEn?: string[];
  creadoEn: string;
  actualizadoEn: string;
}

// --- Documentos ---
export type TipoDocumento = 'consentimiento' | 'informacion' | 'protocolo' | 'formulario' | 'otro';

export interface Documento {
  id: string;
  titulo: string;
  tipo: TipoDocumento;
  descripcion?: string;
  contenido: string;
  etiquetas?: string[];
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

// --- Presupuestos ---
export interface Practica {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMinutos?: number;
  categoria?: string;
  activa: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ItemTratamiento {
  practicaId: string;
  practicaNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Tratamiento {
  id: string;
  nombre: string;
  descripcion?: string;
  practicas: ItemTratamiento[];
  precioTotal: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export type TipoItemPresupuesto = 'practica' | 'tratamiento' | 'examen_externo';
export type EstadoPresupuesto = 'borrador' | 'enviado' | 'aceptado' | 'rechazado' | 'vencido';

export interface ItemPresupuesto {
  tipo: TipoItemPresupuesto;
  referenciaId?: string;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  profesional?: string;
  institucion?: string;
}

export interface Presupuesto {
  id: string;
  numero?: string;
  pacienteId?: string;
  pacienteNombre?: string;
  items: ItemPresupuesto[];
  subtotal: number;
  descuento: number;
  total: number;
  validoHasta?: string;
  estado: EstadoPresupuesto;
  notas?: string;
  creadoEn: string;
  actualizadoEn: string;
}

// ─── Cuenta / Planes ──────────────────────────────────────────────────────────

export type PlanId = 'gratuito' | 'basico' | 'profesional' | 'clinica';

export interface PlanLimites {
  tokensIA: number;       // tokens/mes  (-1 = ilimitado)
  pacientes: number;      // -1 = ilimitado
  almacenamientoMB: number;
  documentos: number;     // -1 = ilimitado
}

export interface Plan {
  id: PlanId;
  nombre: string;
  precioBase: number;      // ARS/mes
  limites: PlanLimites;
  descripcion: string;
  color: string;
}

export interface MetricaUso {
  usado: number;
  limite: number;          // -1 = ilimitado
  unidad: string;
  label: string;
}

export interface CuentaUso {
  tokensIA: MetricaUso;
  pacientes: MetricaUso;
  almacenamientoMB: MetricaUso;
  documentos: MetricaUso;
  periodoActual: string;   // "2025-05"
  costoExtraIA: number;    // ARS extra este mes
  precioExtraToken: number; // ARS por cada 1000 tokens extra
}


