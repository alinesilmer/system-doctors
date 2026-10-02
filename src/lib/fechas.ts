/**
 * Fechas de calendario (`YYYY-MM-DD`) tal como las vive el consultorio.
 * `toISOString()` devuelve la fecha en UTC: en Argentina, a partir de las 21 h
 * ya es "mañana", y en un servidor en UTC el corrimiento es permanente.
 */

const ZONA_CONSULTORIO = 'America/Argentina/Buenos_Aires';
const UN_DIA_MS = 24 * 60 * 60 * 1000;

// El locale en-CA formatea como YYYY-MM-DD.
const enZonaDelConsultorio = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_CONSULTORIO, year: 'numeric', month: '2-digit', day: '2-digit',
});

/** Fecha de hoy en el consultorio, sin importar la zona del servidor o del navegador. */
export function hoyIso(): string {
  return enZonaDelConsultorio.format(new Date());
}

export function mananaIso(): string {
  return enZonaDelConsultorio.format(new Date(Date.now() + UN_DIA_MS));
}

/** Fecha de calendario de un `Date` armado en hora local (p. ej. una celda del calendario). */
export function aFechaIso(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Edad en años cumplidos a partir de una fecha `YYYY-MM-DD`; vacío si no es plausible. */
export function calcularEdad(fechaNacimiento: string): string {
  if (!fechaNacimiento) return '';
  const nac = new Date(fechaNacimiento + 'T00:00:00');
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  if (edad < 0 || edad > 130) return '';
  return `${edad} años`;
}

/** Las siete fechas (lunes a domingo) de la semana que contiene a `hoy`. */
export function diasDeLaSemana(hoy: string): string[] {
  const base = new Date(`${hoy}T00:00:00`);
  base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return aFechaIso(d);
  });
}

/** Hora actual del consultorio, `HH:MM`. */
export function horaActual(): string {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: ZONA_CONSULTORIO });
}

/**
 * "12 sep 2026". Una fecha `YYYY-MM-DD` se lee como día de calendario local;
 * con `new Date(iso)` a secas sería medianoche UTC, es decir, el día anterior acá.
 */
export function fechaCorta(iso: string): string {
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}
