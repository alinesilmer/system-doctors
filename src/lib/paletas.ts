/** Paletas de color disponibles; los valores viven en `globals.css` bajo `:root[data-p]`. */
export const PALETAS = [
  { id: 'cielo',   nombre: 'Cielo',   muestra: ['#E9F1FF', '#FF5C8A', '#1B2559'] },
  { id: 'menta',   nombre: 'Menta',   muestra: ['#E4F4EE', '#FF6542', '#0F3B33'] },
  { id: 'durazno', nombre: 'Durazno', muestra: ['#FFEFE3', '#E8452C', '#3A1D4D'] },
  { id: 'noche',   nombre: 'Noche',   muestra: ['#12172E', '#FF6F9C', '#EDF0FF'] },
  { id: 'cmc',     nombre: 'CMC',     muestra: ['#070D1F', '#FCE8A0', '#1B3A6B'] },
] as const;

export type PaletaId = (typeof PALETAS)[number]['id'];

const CLAVE = 'paleta';
const POR_DEFECTO: PaletaId = 'cielo';

const esPaleta = (v: string | null): v is PaletaId => PALETAS.some((p) => p.id === v);

export function paletaGuardada(): PaletaId {
  try {
    const v = localStorage.getItem(CLAVE);
    return esPaleta(v) ? v : POR_DEFECTO;
  } catch {
    return POR_DEFECTO;
  }
}

export function aplicarPaleta(id: PaletaId): void {
  document.documentElement.dataset.p = id;
  try {
    localStorage.setItem(CLAVE, id);
  } catch {
    // Sin almacenamiento disponible la elección vale sólo para esta visita.
  }
}

/**
 * Se ejecuta en el <head>, antes de pintar, para que la página no parpadee con
 * la paleta por defecto mientras carga la elegida.
 */
export const SCRIPT_PALETA = `try{var d=document.documentElement,p=localStorage.getItem('${CLAVE}');if(p)d.dataset.p=p;` +
  // El splash de apertura sólo la primera vez que se abre la app en esta pestaña.
  `if(sessionStorage.getItem('splash'))d.dataset.visto='1';else sessionStorage.setItem('splash','1')}catch(e){}`;
