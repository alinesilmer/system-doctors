/**
 * Forma común de toda entidad persistida. Vive aparte del repositorio para que
 * los componentes puedan usar estos tipos y helpers sin cargar el SDK de
 * Firestore en el navegador.
 */

/** Campos que Firestore administra por nosotros en toda entidad persistida. */
export interface EntidadBase {
  id: string;
  creadoEn: string;
  actualizadoEn: string;
}

/** Lo que acepta `crear`: la entidad sin los campos generados por Firestore. */
export type DatosNuevos<T extends EntidadBase> = Omit<T, keyof EntidadBase>;

/** El id y las fechas de auditoría nunca se sobrescriben desde el cliente. */
export function sinCamposDeAuditoria<T extends EntidadBase>(datos: Partial<T>): Partial<T> {
  const copia = { ...datos };
  delete copia.id;
  delete copia.creadoEn;
  delete copia.actualizadoEn;
  return copia;
}

/** Los campos de una entidad que un formulario puede editar. */
export function datosEditables<T extends EntidadBase>(entidad: T): DatosNuevos<T> {
  return sinCamposDeAuditoria(entidad) as DatosNuevos<T>;
}
