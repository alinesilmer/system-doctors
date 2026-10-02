import { aFechaIso, diasDeLaSemana, hoyIso } from '@/lib/fechas';
import type {
  ConversacionWA, Documento, EntradaHistoriaClinica, FormularioInvitacion, InsuranceProvider,
  ItemStock, Medicamento, MensajeWA, MovimientoStock, Paciente, Practica, Presupuesto,
  PricingAgreement, Tratamiento, Turno,
} from '@/lib/types';

/**
 * Datos de muestra del modo demo. Todas las personas son inventadas. Los turnos
 * se arman sobre la semana en curso para que la agenda y el inicio nunca
 * aparezcan vacíos.
 */

export interface BaseDemo {
  pacientes: Paciente[];
  turnos: Turno[];
  stock: ItemStock[];
  practicas: Practica[];
  tratamientos: Tratamiento[];
  presupuestos: Presupuesto[];
  documentos: Documento[];
  medicamentos: Medicamento[];
  movimientos: MovimientoStock[];
  historias: EntradaHistoriaClinica[];
  invitaciones: FormularioInvitacion[];
  conversaciones: ConversacionWA[];
  mensajes: MensajeWA[];
}

const haceDias = (dias: number, hora = '10:00') => {
  const d = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  const [h, m] = hora.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

/** Fecha de calendario de hace `dias` días. */
const fechaHace = (dias: number) => aFechaIso(new Date(Date.now() - dias * 24 * 60 * 60 * 1000));

const haceMinutos = (minutos: number) => new Date(Date.now() - minutos * 60 * 1000).toISOString();

/** Sello de alta y modificación para las entidades sembradas. */
const sello = (dias: number) => ({ creadoEn: haceDias(dias), actualizadoEn: haceDias(dias) });

export function sembrar(): BaseDemo {
  const hoy = hoyIso();
  const semana = diasDeLaSemana(hoy);

  const pacientes: Paciente[] = [
    {
      id: 'pac-1', nombre: 'Lucía', apellido: 'Acosta', dni: '32145678', fechaNacimiento: '1986-03-14', sexo: 'femenino',
      telefono: '3794501122', email: 'lucia.acosta@ejemplo.com', direccion: 'Junín 1240, Corrientes', obraSocial: 'OSDE',
      nroAfiliado: '6112345678', grupoSanguineo: 'A+', alergias: 'Penicilina', notas: 'Prefiere turnos por la mañana.',
      antFamiliares: { padre: ['Hipertensión'], madre: ['Diabetes tipo 2'], hermanos: [] },
      antPersonales: { cirugias: ['Apendicectomía (2009)'], internaciones: [] },
      habitos: { items: ['No fuma', 'Actividad física 3 veces por semana'] },
      ...sello(140),
    },
    {
      id: 'pac-2', nombre: 'Martín', apellido: 'Benítez', dni: '28765432', fechaNacimiento: '1979-11-02', sexo: 'masculino',
      telefono: '3794512233', email: 'martin.benitez@ejemplo.com', obraSocial: 'Swiss Medical', nroAfiliado: '80045612',
      grupoSanguineo: 'O+', notas: 'Control de presión cada tres meses.',
      antFamiliares: { padre: ['Infarto a los 62'], madre: [], hermanos: ['Hipertensión'] },
      antPersonales: { cirugias: [], internaciones: ['Neumonía (2018)'] },
      habitos: { items: ['Ex fumador', 'Sedentario'] },
      ...sello(120),
    },
    {
      id: 'pac-3', nombre: 'Camila', apellido: 'Duarte', dni: '40112233', fechaNacimiento: '1997-07-21', sexo: 'femenino',
      telefono: '3794523344', email: 'camila.duarte@ejemplo.com', obraSocial: 'Particular / Sin cobertura', grupoSanguineo: 'B+',
      ...sello(95),
    },
    {
      id: 'pac-4', nombre: 'Jorge', apellido: 'Fernández', dni: '17890123', fechaNacimiento: '1964-01-30', sexo: 'masculino',
      telefono: '3794534455', obraSocial: 'PAMI', nroAfiliado: '150789012301', grupoSanguineo: 'A-',
      alergias: 'Ibuprofeno', notas: 'Viene acompañado por su hija.',
      antFamiliares: { padre: [], madre: ['Artrosis'], hermanos: [] },
      antPersonales: { cirugias: ['Prótesis de rodilla derecha (2021)'], internaciones: [] },
      ...sello(80),
    },
    {
      id: 'pac-5', nombre: 'Sofía', apellido: 'Giménez', dni: '36554433', fechaNacimiento: '1991-09-09', sexo: 'femenino',
      telefono: '3794545566', email: 'sofia.gimenez@ejemplo.com', obraSocial: 'Galeno', nroAfiliado: '22998877', grupoSanguineo: 'O-',
      ...sello(61),
    },
    {
      id: 'pac-6', nombre: 'Tomás', apellido: 'Ledesma', dni: '43221100', fechaNacimiento: '2001-05-17', sexo: 'masculino',
      telefono: '3794556677', obraSocial: 'IOMA', nroAfiliado: '4322110001', notas: 'Deportista: consulta por lesión de tobillo.',
      ...sello(40),
    },
    {
      id: 'pac-7', nombre: 'Elena', apellido: 'Romero', dni: '12998877', fechaNacimiento: '1957-12-05', sexo: 'femenino',
      telefono: '3794567788', obraSocial: 'PAMI', nroAfiliado: '150129988701', grupoSanguineo: 'AB+', alergias: 'Látex',
      antFamiliares: { padre: ['Diabetes tipo 2'], madre: ['Hipotiroidismo'], hermanos: [] },
      antPersonales: { cirugias: ['Colecistectomía (2003)'], internaciones: [] },
      habitos: { items: ['Camina a diario'] },
      ...sello(22),
    },
    {
      id: 'pac-8', nombre: 'Nicolás', apellido: 'Sosa', dni: '34667788', fechaNacimiento: '1989-04-26', sexo: 'masculino',
      telefono: '3794578899', email: 'nicolas.sosa@ejemplo.com', obraSocial: 'Medifé', nroAfiliado: '77123400', grupoSanguineo: 'B-',
      ...sello(9),
    },
  ];

  const nombreDe = (id: string) => {
    const p = pacientes.find((x) => x.id === id)!;
    return `${p.apellido}, ${p.nombre}`;
  };

  const turno = (
    n: number, dia: number, horaInicio: string, horaFin: string, pacienteId: string, motivo: string, estado: Turno['estado'],
  ): Turno => ({
    id: `tur-${n}`, pacienteId, pacienteNombre: nombreDe(pacienteId), fecha: semana[dia], horaInicio, horaFin, motivo, estado,
    ...sello(6),
  });

  // Lo que ya pasó en la semana figura como atendido; lo que viene, como agendado.
  const segunDia = (dia: number, agendado: Turno['estado'] = 'confirmado'): Turno['estado'] =>
    semana[dia] < hoy ? 'completado' : agendado;

  const turnos: Turno[] = [
    turno(1, 0, '09:00', '09:30', 'pac-1', 'Control anual', segunDia(0)),
    turno(2, 0, '10:00', '10:30', 'pac-4', 'Dolor de rodilla', segunDia(0)),
    turno(3, 1, '09:30', '10:00', 'pac-2', 'Control de presión', segunDia(1)),
    turno(4, 1, '11:00', '11:30', 'pac-6', 'Esguince de tobillo', semana[1] < hoy ? 'no_asistio' : 'pendiente'),
    turno(5, 2, '08:30', '09:00', 'pac-5', 'Resultados de laboratorio', segunDia(2)),
    turno(6, 2, '10:30', '11:00', 'pac-7', 'Control de tiroides', segunDia(2, 'pendiente')),
    turno(7, 3, '09:00', '09:30', 'pac-3', 'Primera consulta', segunDia(3, 'pendiente')),
    turno(8, 3, '16:00', '16:30', 'pac-8', 'Certificado de aptitud física', segunDia(3)),
    turno(9, 4, '09:00', '09:30', 'pac-2', 'Ajuste de medicación', segunDia(4)),
    turno(10, 4, '11:30', '12:00', 'pac-1', 'Vacunación antigripal', segunDia(4, 'pendiente')),
    turno(11, 5, '10:00', '10:30', 'pac-4', 'Control posoperatorio', segunDia(5, 'pendiente')),
  ];
  // Hoy siempre tiene agenda, caiga en el día que caiga.
  const diaDeHoy = semana.indexOf(hoy);
  turnos.push(
    turno(12, diaDeHoy, '15:00', '15:30', 'pac-5', 'Seguimiento', 'confirmado'),
    turno(13, diaDeHoy, '17:30', '18:00', 'pac-7', 'Receta mensual', 'pendiente'),
  );

  const stock: ItemStock[] = [
    { id: 'stk-1', nombre: 'Guantes de nitrilo M', categoria: 'Descartables', cantidad: 12, cantidadMinima: 20, unidad: 'cajas', proveedor: 'Insumos del Litoral', codigoInterno: 'DES-001', ubicacion: 'Depósito, estante 1', ...sello(60) },
    { id: 'stk-2', nombre: 'Jeringas 5 ml', categoria: 'Descartables', cantidad: 340, cantidadMinima: 100, unidad: 'unidades', proveedor: 'Insumos del Litoral', codigoInterno: 'DES-014', lote: 'L-2291', fechaVencimiento: '2028-03-31', ...sello(60) },
    { id: 'stk-3', nombre: 'Gasas estériles 10×10', categoria: 'Curaciones', cantidad: 85, cantidadMinima: 50, unidad: 'sobres', proveedor: 'Droguería Norte', codigoInterno: 'CUR-003', ...sello(45) },
    { id: 'stk-4', nombre: 'Alcohol en gel 500 ml', categoria: 'Higiene', cantidad: 4, cantidadMinima: 6, unidad: 'frascos', proveedor: 'Droguería Norte', codigoInterno: 'HIG-002', ...sello(45) },
    { id: 'stk-5', nombre: 'Lidocaína 2% ampollas', categoria: 'Medicación', cantidad: 30, cantidadMinima: 15, unidad: 'ampollas', proveedor: 'Droguería Norte', codigoInterno: 'MED-021', lote: 'A-7710', fechaVencimiento: '2027-08-31', ubicacion: 'Vitrina bajo llave', ...sello(30) },
    { id: 'stk-6', nombre: 'Tiras reactivas de glucemia', categoria: 'Diagnóstico', cantidad: 0, cantidadMinima: 50, unidad: 'tiras', proveedor: 'Insumos del Litoral', codigoInterno: 'DIA-005', ...sello(30) },
    { id: 'stk-7', nombre: 'Baja lenguas de madera', categoria: 'Descartables', cantidad: 500, cantidadMinima: 100, unidad: 'unidades', codigoInterno: 'DES-020', ...sello(20) },
    { id: 'stk-8', nombre: 'Vendas elásticas 10 cm', categoria: 'Curaciones', cantidad: 26, cantidadMinima: 10, unidad: 'rollos', proveedor: 'Droguería Norte', codigoInterno: 'CUR-011', ...sello(20) },
  ];

  const movimientos: MovimientoStock[] = [
    { id: 'mov-1', itemId: 'stk-6', itemNombre: 'Tiras reactivas de glucemia', tipo: 'salida', cantidad: 25, cantidadAnterior: 25, cantidadNueva: 0, motivo: 'Controles de la semana', creadoEn: haceDias(1, '12:10') },
    { id: 'mov-2', itemId: 'stk-1', itemNombre: 'Guantes de nitrilo M', tipo: 'salida', cantidad: 3, cantidadAnterior: 15, cantidadNueva: 12, motivo: 'Uso en consultorio', creadoEn: haceDias(2, '18:30') },
    { id: 'mov-3', itemId: 'stk-2', itemNombre: 'Jeringas 5 ml', tipo: 'entrada', cantidad: 200, cantidadAnterior: 140, cantidadNueva: 340, motivo: 'Compra a Insumos del Litoral', creadoEn: haceDias(5, '09:15') },
    { id: 'mov-4', itemId: 'stk-4', itemNombre: 'Alcohol en gel 500 ml', tipo: 'ajuste', cantidad: 4, cantidadAnterior: 5, cantidadNueva: 4, motivo: 'Recuento', creadoEn: haceDias(8, '08:40') },
  ];

  const practicas: Practica[] = [
    { id: 'pra-1', nombre: 'Consulta clínica', descripcion: 'Consulta general en consultorio', precio: 18_000, duracionMinutos: 30, categoria: 'Consultas', activa: true, ...sello(200) },
    { id: 'pra-2', nombre: 'Electrocardiograma', precio: 22_000, duracionMinutos: 20, categoria: 'Estudios', activa: true, ...sello(200) },
    { id: 'pra-3', nombre: 'Curación simple', precio: 9_500, duracionMinutos: 15, categoria: 'Enfermería', activa: true, ...sello(200) },
    { id: 'pra-4', nombre: 'Infiltración articular', precio: 45_000, duracionMinutos: 30, categoria: 'Procedimientos', activa: true, ...sello(180) },
    { id: 'pra-5', nombre: 'Certificado de aptitud física', precio: 15_000, duracionMinutos: 20, categoria: 'Consultas', activa: true, ...sello(180) },
    { id: 'pra-6', nombre: 'Extracción de puntos', precio: 8_000, duracionMinutos: 10, categoria: 'Enfermería', activa: false, ...sello(150) },
  ];

  const tratamientos: Tratamiento[] = [
    {
      id: 'tra-1', nombre: 'Control cardiológico', descripcion: 'Consulta con electrocardiograma',
      practicas: [
        { practicaId: 'pra-1', practicaNombre: 'Consulta clínica', cantidad: 1, precioUnitario: 18_000, subtotal: 18_000 },
        { practicaId: 'pra-2', practicaNombre: 'Electrocardiograma', cantidad: 1, precioUnitario: 22_000, subtotal: 22_000 },
      ],
      precioTotal: 40_000, activo: true, ...sello(100),
    },
    {
      id: 'tra-2', nombre: 'Infiltraciones de rodilla', descripcion: 'Tres sesiones con control final',
      practicas: [
        { practicaId: 'pra-4', practicaNombre: 'Infiltración articular', cantidad: 3, precioUnitario: 45_000, subtotal: 135_000 },
        { practicaId: 'pra-1', practicaNombre: 'Consulta clínica', cantidad: 1, precioUnitario: 18_000, subtotal: 18_000 },
      ],
      precioTotal: 153_000, activo: true, ...sello(70),
    },
  ];

  const presupuestos: Presupuesto[] = [
    {
      id: 'pre-1', numero: '0001', pacienteId: 'pac-4', pacienteNombre: nombreDe('pac-4'),
      items: [{ tipo: 'tratamiento', referenciaId: 'tra-2', nombre: 'Infiltraciones de rodilla', cantidad: 1, precioUnitario: 153_000, subtotal: 153_000 }],
      subtotal: 153_000, descuento: 13_000, total: 140_000, validoHasta: semana[6], estado: 'enviado',
      notas: 'Descuento por pago en efectivo.', ...sello(4),
    },
    {
      id: 'pre-2', numero: '0002', pacienteId: 'pac-2', pacienteNombre: nombreDe('pac-2'),
      items: [
        { tipo: 'tratamiento', referenciaId: 'tra-1', nombre: 'Control cardiológico', cantidad: 1, precioUnitario: 40_000, subtotal: 40_000 },
        { tipo: 'examen_externo', nombre: 'Ecocardiograma', cantidad: 1, precioUnitario: 60_000, subtotal: 60_000, institucion: 'Centro de Diagnóstico' },
      ],
      subtotal: 100_000, descuento: 0, total: 100_000, estado: 'aceptado', ...sello(12),
    },
    {
      id: 'pre-3', numero: '0003', pacienteId: 'pac-8', pacienteNombre: nombreDe('pac-8'),
      items: [{ tipo: 'practica', referenciaId: 'pra-5', nombre: 'Certificado de aptitud física', cantidad: 1, precioUnitario: 15_000, subtotal: 15_000 }],
      subtotal: 15_000, descuento: 0, total: 15_000, estado: 'borrador', ...sello(1),
    },
  ];

  const documentos: Documento[] = [
    {
      id: 'doc-1', titulo: 'Consentimiento para infiltración', tipo: 'consentimiento', descripcion: 'Firma previa al procedimiento',
      contenido: 'Declaro haber sido informado/a sobre el procedimiento de infiltración articular, sus beneficios, riesgos y alternativas, y presto mi consentimiento para su realización.',
      etiquetas: ['traumatología'], activo: true, ...sello(90),
    },
    {
      id: 'doc-2', titulo: 'Cuidados después de una curación', tipo: 'informacion',
      contenido: 'Mantener la zona limpia y seca durante 24 horas. No retirar el apósito antes del próximo control. Consultar ante fiebre, enrojecimiento o dolor en aumento.',
      etiquetas: ['enfermería'], activo: true, ...sello(75),
    },
    {
      id: 'doc-3', titulo: 'Protocolo de toma de presión', tipo: 'protocolo',
      contenido: 'Paciente sentado, cinco minutos de reposo, brazo a la altura del corazón. Dos tomas separadas por un minuto; registrar el promedio.',
      activo: true, ...sello(50),
    },
  ];

  const medicamentos: Medicamento[] = [
    { id: 'med-1', nombre: 'Losartán 50', principioActivo: 'Losartán potásico', laboratorio: 'Laboratorio Austral', presentacion: '30 comprimidos', forma: 'comprimido', categoria: 'Antihipertensivo', requiereReceta: true, precioSugerido: 8_900, ...sello(110) },
    { id: 'med-2', nombre: 'Paracetamol 500', principioActivo: 'Paracetamol', laboratorio: 'Laboratorio Austral', presentacion: '20 comprimidos', forma: 'comprimido', categoria: 'Analgésico', requiereReceta: false, precioSugerido: 2_400, ...sello(110) },
    { id: 'med-3', nombre: 'Amoxicilina 500', principioActivo: 'Amoxicilina', laboratorio: 'Farma Litoral', presentacion: '16 cápsulas', forma: 'capsula', categoria: 'Antibiótico', requiereReceta: true, precioSugerido: 6_300, ...sello(100) },
    { id: 'med-4', nombre: 'Salbutamol aerosol', principioActivo: 'Salbutamol', laboratorio: 'Farma Litoral', presentacion: '200 dosis', forma: 'inhalador', categoria: 'Broncodilatador', requiereReceta: true, precioSugerido: 11_500, ...sello(90) },
    { id: 'med-5', nombre: 'Diclofenac gel', principioActivo: 'Diclofenac dietilamina', laboratorio: 'Laboratorio Austral', presentacion: 'Pomo de 50 g', forma: 'crema', categoria: 'Antiinflamatorio', requiereReceta: false, precioSugerido: 5_200, ...sello(60) },
  ];

  const historias: EntradaHistoriaClinica[] = [
    {
      id: 'his-1', pacienteId: 'pac-1', fecha: fechaHace(35), tipo: 'consulta', titulo: 'Control anual',
      contenido: 'Paciente asintomática. TA 115/75. Se solicitan análisis de rutina.', creadoPor: 'Dra. Demo', creadoEn: haceDias(35),
    },
    {
      id: 'his-2', pacienteId: 'pac-1', fecha: fechaHace(20), tipo: 'estudio', titulo: 'Laboratorio de rutina',
      contenido: 'Hemograma, glucemia y perfil lipídico dentro de valores normales.', creadoPor: 'Dra. Demo', creadoEn: haceDias(20),
    },
    {
      id: 'his-3', pacienteId: 'pac-2', fecha: fechaHace(28), tipo: 'consulta', titulo: 'Control de presión',
      contenido: 'TA 150/95 en dos tomas. Se ajusta dosis de losartán y se indica control en tres semanas.', creadoPor: 'Dra. Demo', creadoEn: haceDias(28),
    },
    {
      id: 'his-4', pacienteId: 'pac-4', fecha: fechaHace(14), tipo: 'derivacion', titulo: 'Derivación a kinesiología',
      contenido: 'Gonalgia derecha posquirúrgica. Se indican diez sesiones de kinesiología.', creadoPor: 'Dra. Demo', creadoEn: haceDias(14),
    },
  ];

  const invitaciones: FormularioInvitacion[] = [
    { id: 'inv-1', token: 'demo-pendiente', estado: 'pendiente', creadoEn: haceDias(1) },
    {
      id: 'inv-2', token: 'demo-completada', estado: 'completado', creadoEn: haceDias(3), completadoEn: haceDias(2),
      datosPaciente: {
        nombre: 'Valentina', apellido: 'Ortiz', dni: '38990011', fechaNacimiento: '1994-02-11', sexo: 'femenino',
        telefono: '3794589900', email: 'valentina.ortiz@ejemplo.com', obraSocial: 'Sancor Salud',
      },
    },
  ];

  const conversaciones: ConversacionWA[] = [
    { id: '5493794501122', telefono: '5493794501122', nombre: 'Lucía Acosta', pacienteId: 'pac-1', ultimoMensaje: '¿Puedo pasar el turno del viernes a la tarde?', ultimaActividad: haceMinutos(12), noLeidos: 1, prioridad: 'normal', estado: 'activo', creadoEn: haceDias(30) },
    { id: '5493794534455', telefono: '5493794534455', nombre: 'Jorge Fernández', pacienteId: 'pac-4', ultimoMensaje: 'Tengo la rodilla muy hinchada y con fiebre desde anoche', ultimaActividad: haceMinutos(40), noLeidos: 2, prioridad: 'urgente', estado: 'activo', creadoEn: haceDias(15) },
    { id: '5493794567788', telefono: '5493794567788', nombre: 'Elena Romero', pacienteId: 'pac-7', ultimoMensaje: 'Muchas gracias, doctora.', ultimaActividad: haceMinutos(60 * 26), noLeidos: 0, prioridad: 'baja', estado: 'activo', creadoEn: haceDias(8) },
  ];

  const mensajes: MensajeWA[] = [
    { id: 'msg-1', telefono: '5493794501122', nombre: 'Lucía Acosta', cuerpo: 'Hola, buen día.', direccion: 'entrante', respondido: true, creadoEn: haceMinutos(15) },
    {
      id: 'msg-2', telefono: '5493794501122', nombre: 'Lucía Acosta', cuerpo: '¿Puedo pasar el turno del viernes a la tarde?', direccion: 'entrante',
      clasificacion: 'turno', urgencia: 'baja', derivarA: 'secretaria', resumen: 'Pide reprogramar el turno del viernes.',
      respuestaSugerida: 'Hola Lucía, sí: tenemos lugar el viernes a las 16:00. ¿Te lo reservo?', respondido: false, creadoEn: haceMinutos(12),
    },
    {
      id: 'msg-3', telefono: '5493794534455', nombre: 'Jorge Fernández', cuerpo: 'Doctora, disculpe la hora.', direccion: 'entrante',
      respondido: false, creadoEn: haceMinutos(42),
    },
    {
      id: 'msg-4', telefono: '5493794534455', nombre: 'Jorge Fernández', cuerpo: 'Tengo la rodilla muy hinchada y con fiebre desde anoche', direccion: 'entrante',
      clasificacion: 'urgencia', urgencia: 'alta', derivarA: 'medico', resumen: 'Rodilla operada con hinchazón y fiebre.',
      respuestaSugerida: 'Jorge, por lo que describe necesito verlo hoy. ¿Puede acercarse al consultorio a las 15:00?', respondido: false, creadoEn: haceMinutos(40),
    },
    {
      id: 'msg-5', telefono: '5493794567788', nombre: 'Elena Romero', cuerpo: '¿Me puede renovar la receta de levotiroxina?', direccion: 'entrante',
      clasificacion: 'receta', urgencia: 'baja', derivarA: 'medico', respondido: true, creadoEn: haceMinutos(60 * 27),
    },
    { id: 'msg-6', telefono: '5493794567788', cuerpo: 'Sí, Elena. Queda lista para retirar mañana.', direccion: 'saliente', respondido: true, creadoEn: haceMinutos(60 * 26 + 20) },
    { id: 'msg-7', telefono: '5493794567788', nombre: 'Elena Romero', cuerpo: 'Muchas gracias, doctora.', direccion: 'entrante', clasificacion: 'confirmacion', respondido: true, creadoEn: haceMinutos(60 * 26) },
  ];

  return {
    pacientes, turnos, stock, practicas, tratamientos, presupuestos, documentos, medicamentos,
    movimientos, historias, invitaciones, conversaciones, mensajes,
  };
}

// ─── Obras sociales ──────────────────────────────────────────────────────────

export const OBRAS_SOCIALES_DEMO: InsuranceProvider[] = [
  { id: 'os-1', nombre: 'IOMA', codigoObraSocial: 'IOMA', activa: true, creadoEn: haceDias(300) },
  { id: 'os-2', nombre: 'OSDE', codigoObraSocial: 'OSDE', activa: true, creadoEn: haceDias(300) },
  { id: 'os-3', nombre: 'PAMI', codigoObraSocial: 'PAMI', activa: true, creadoEn: haceDias(300) },
];

const ARANCELES: Record<string, number> = { 'os-1': 0.8, 'os-2': 1.25, 'os-3': 0.7 };

export function convenioDemo(providerId: string): PricingAgreement | null {
  const factor = ARANCELES[providerId];
  if (!factor) return null;
  const item = (codigo: string, descripcion: string, base: number) => ({ codigo, descripcion, precio: Math.round(base * factor), unidad: 'práctica' });

  return {
    id: `conv-${providerId}`,
    providerId,
    vigenciaDesde: `${new Date().getFullYear()}-01-01`,
    descripcion: 'Convenio de muestra',
    items: [
      item('42.01.01', 'Consulta médica en consultorio', 18_000),
      item('17.01.01', 'Electrocardiograma en consultorio', 22_000),
      item('43.02.01', 'Curación simple', 9_500),
      item('12.18.01', 'Infiltración articular', 45_000),
      item('42.03.01', 'Consulta a domicilio', 30_000),
    ],
    creadoEn: haceDias(200),
  };
}
