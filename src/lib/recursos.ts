import type { RecursoCrud } from './api/crud';
import { crearRepositorio } from './firestore/repository';
import { repositorioPacientes } from './firestore/pacientes';
import { repositorioStock } from './firestore/stock';
import { repositorioTurnos } from './firestore/turnos';
import {
  esquemaDocumento, esquemaItemStock, esquemaMedicamento, esquemaPaciente,
  esquemaPractica, esquemaPresupuesto, esquemaTratamiento, esquemaTurno,
} from './esquemas';
import type {
  Documento, ItemStock, Medicamento, Paciente, Practica, Presupuesto, Tratamiento, Turno,
} from './types';

/**
 * Catálogo de recursos con CRUD estándar: colección, validación y etiqueta.
 * Sumar una entidad nueva es agregar una entrada acá y dos archivos `route.ts`
 * de una línea (ver `app/api/practicas`).
 */

export const pacientes: RecursoCrud<Paciente> = {
  repo: repositorioPacientes,
  esquema: esquemaPaciente,
  etiqueta: 'Paciente',
  porDefecto: { fechaNacimiento: '', sexo: 'no_especificado', telefono: '' },
};

export const turnos: RecursoCrud<Turno> = {
  repo: repositorioTurnos,
  esquema: esquemaTurno,
  etiqueta: 'Turno',
  porDefecto: { estado: 'pendiente', horaFin: '', motivo: '' },
};

export const stock: RecursoCrud<ItemStock> = {
  repo: repositorioStock,
  esquema: esquemaItemStock,
  etiqueta: 'Item',
  porDefecto: { cantidad: 0, cantidadMinima: 0, unidad: 'unidades' },
};

export const practicas: RecursoCrud<Practica> = {
  repo: crearRepositorio<Practica>('practicas', 'nombre'),
  esquema: esquemaPractica,
  etiqueta: 'Práctica',
  femenino: true,
  porDefecto: { activa: true },
};

export const tratamientos: RecursoCrud<Tratamiento> = {
  repo: crearRepositorio<Tratamiento>('tratamientos', 'nombre'),
  esquema: esquemaTratamiento,
  etiqueta: 'Tratamiento',
  porDefecto: { practicas: [], precioTotal: 0, activo: true },
};

export const presupuestos: RecursoCrud<Presupuesto> = {
  repo: crearRepositorio<Presupuesto>('presupuestos', 'creadoEn', 'desc'),
  esquema: esquemaPresupuesto,
  etiqueta: 'Presupuesto',
  porDefecto: { subtotal: 0, descuento: 0, total: 0, estado: 'borrador' },
};

export const documentos: RecursoCrud<Documento> = {
  repo: crearRepositorio<Documento>('documentos', 'titulo'),
  esquema: esquemaDocumento,
  etiqueta: 'Documento',
  porDefecto: { activo: true },
};

export const medicamentos: RecursoCrud<Medicamento> = {
  repo: crearRepositorio<Medicamento>('medicamentos', 'nombre'),
  esquema: esquemaMedicamento,
  etiqueta: 'Medicamento',
  porDefecto: { forma: 'otro', requiereReceta: false },
};
