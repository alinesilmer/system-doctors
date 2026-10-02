/** Estilos `sx` compartidos del diseño "Camino". Los colores son siempre tokens de `globals.css`. */

export const DISPLAY = 'var(--font-display)';

/** Superficie base: tarjeta blanca de esquinas amplias. */
export const tarjeta = {
  backgroundColor: 'var(--card)',
  borderRadius: '1.75rem',
} as const;

/** Tarjeta que flota (lo único con sombra: el elemento que se quiere destacar). */
export const flotante = { ...tarjeta, boxShadow: 'var(--shadow)' } as const;

/** Bloque con una esquina recta que se redondea y se levanta al pasar el mouse. */
export const bloque = {
  backgroundColor: 'var(--card)',
  color: 'var(--ink)',
  borderRadius: '2rem 2rem 2rem 0.6rem',
  textDecoration: 'none',
  transition: 'transform 0.25s var(--spring), border-radius 0.3s, box-shadow 0.25s',
  '&:hover': { transform: 'translateY(-6px) rotate(-1.5deg)', borderRadius: '2rem' },
} as const;

/** Botón circular lleno, para una única acción con ícono. */
export const redondo = {
  width: '3.2rem',
  height: '3.2rem',
  flexShrink: 0,
  borderRadius: '50%',
  border: 0,
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
  backgroundColor: 'var(--solid)',
  color: 'var(--on-solid)',
  textDecoration: 'none',
  transition: 'transform 0.25s var(--spring), background-color 0.2s, color 0.2s',
  '&:hover': { transform: 'scale(1.1)', backgroundColor: 'var(--pink)', color: 'var(--on-accent)' },
} as const;

/** Variante clara del botón circular (volver, acciones secundarias). */
export const redondoClaro = {
  ...redondo,
  backgroundColor: 'var(--card)',
  color: 'var(--ink)',
  boxShadow: 'var(--shadow)',
  '&:hover': { transform: 'scale(1.1)', backgroundColor: 'var(--solid)', color: 'var(--on-solid)' },
} as const;

/** Rótulo pequeño en mayúsculas, del color del acento. */
export const rotulo = {
  color: 'var(--pink)',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontSize: '0.72rem',
} as const;

/** Número o palabra grande con la tipografía de titulares. */
export const cifra = {
  fontFamily: DISPLAY,
  fontWeight: 800,
  lineHeight: 1,
  fontVariantNumeric: 'tabular-nums',
} as const;

/** Punto que late: marca lo que está pasando ahora. */
export const latido = {
  width: '0.6rem',
  height: '0.6rem',
  flexShrink: 0,
  borderRadius: '50%',
  backgroundColor: 'var(--pink)',
  color: 'color-mix(in srgb, var(--pink) 55%, transparent)',
  animation: 'ping 1.6s infinite',
} as const;

const TONOS = ['var(--sun)', 'var(--mint)', 'var(--lila)'];

/** Tono estable para un texto: la misma persona recibe siempre el mismo color. */
export function tonoDe(texto: string): string {
  let hash = 0;
  for (const ch of texto) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return TONOS[Math.abs(hash) % TONOS.length];
}
