import type { UsuarioPerfil } from '@/lib/firestore/usuarios';

/**
 * Sesión de DEMOSTRACIÓN, guardada en este navegador.
 *
 * No es seguridad: la credencial vive en el código del cliente y la API sigue
 * sin exigir sesión. Sirve para recorrer el flujo de entrada (login, registro,
 * salir) hasta que se conecte la autenticación real de Firebase; cuando eso
 * pase, sólo cambia este archivo: el resto de la app usa `useAuth()`.
 */

export const CREDENCIAL_DEMO = {
  email: 'demo@medisystem.app',
  password: 'demo1234',
  nombre: 'Dra. Demo',
} as const;

const CLAVE_SESION = 'sesion';
const CLAVE_CUENTAS = 'cuentas-demo';
const EVENTO = 'sesion';

interface CuentaLocal {
  nombre: string;
  email: string;
  /** Huella de email + contraseña; la contraseña nunca se guarda. */
  huella: string;
}

async function huellaDe(email: string, password: string): Promise<string> {
  const datos = new TextEncoder().encode(`${email}:${password}`);
  const hash = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

function leerCuentas(): CuentaLocal[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CUENTAS) ?? '[]') as CuentaLocal[];
  } catch {
    return [];
  }
}

function perfilDe(nombre: string, email: string, rol: UsuarioPerfil['rol']): UsuarioPerfil {
  return { uid: `demo-${email}`, email, nombre, rol, cuentaId: 'demo', activo: true, creadoEn: new Date().toISOString() };
}

function abrirSesion(perfil: UsuarioPerfil): UsuarioPerfil {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(perfil));
  window.dispatchEvent(new Event(EVENTO));
  return perfil;
}

const normalizar = (email: string) => email.trim().toLowerCase();

export async function entrar(email: string, password: string): Promise<UsuarioPerfil> {
  const correo = normalizar(email);

  if (correo === CREDENCIAL_DEMO.email && password === CREDENCIAL_DEMO.password) {
    return abrirSesion(perfilDe(CREDENCIAL_DEMO.nombre, correo, 'admin'));
  }

  const huella = await huellaDe(correo, password);
  const cuenta = leerCuentas().find((c) => c.email === correo && c.huella === huella);
  // Un solo mensaje para ambos casos: no se revela si el email existe.
  if (!cuenta) throw new Error('Email o contraseña incorrectos');
  return abrirSesion(perfilDe(cuenta.nombre, correo, 'medico'));
}

export async function registrar(nombre: string, email: string, password: string): Promise<UsuarioPerfil> {
  const correo = normalizar(email);
  const cuentas = leerCuentas();

  if (!nombre.trim()) throw new Error('Falta tu nombre');
  if (!/^\S+@\S+\.\S+$/.test(correo)) throw new Error('Ese email no parece válido');
  if (password.length < 8) throw new Error('La contraseña necesita 8 caracteres o más');
  if (correo === CREDENCIAL_DEMO.email || cuentas.some((c) => c.email === correo)) {
    throw new Error('Ya hay una cuenta con ese email');
  }

  const cuenta: CuentaLocal = { nombre: nombre.trim(), email: correo, huella: await huellaDe(correo, password) };
  localStorage.setItem(CLAVE_CUENTAS, JSON.stringify([...cuentas, cuenta]));
  return abrirSesion(perfilDe(cuenta.nombre, correo, 'medico'));
}

/** Cambia el nombre visible de la sesión abierta (y de su cuenta local, si tiene). */
export function renombrar(nombre: string): void {
  const actual = leerSesion();
  const limpio = nombre.trim();
  if (!actual || !limpio) throw new Error('Falta el nombre');

  const cuentas = leerCuentas().map((c) => (c.email === actual.email ? { ...c, nombre: limpio } : c));
  localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas));
  abrirSesion({ ...actual, nombre: limpio });
}

export async function cambiarClave(claveActual: string, claveNueva: string): Promise<void> {
  const actual = leerSesion();
  if (!actual) throw new Error('No hay sesión abierta');
  if (actual.email === CREDENCIAL_DEMO.email) throw new Error('La cuenta demo no cambia de contraseña');
  if (claveNueva.length < 8) throw new Error('La contraseña necesita 8 caracteres o más');

  const cuentas = leerCuentas();
  const huellaActual = await huellaDe(actual.email, claveActual);
  if (!cuentas.some((c) => c.email === actual.email && c.huella === huellaActual)) {
    throw new Error('La contraseña actual no es correcta');
  }
  const huella = await huellaDe(actual.email, claveNueva);
  localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas.map((c) => (c.email === actual.email ? { ...c, huella } : c))));
}

export function salir(): void {
  localStorage.removeItem(CLAVE_SESION);
  window.dispatchEvent(new Event(EVENTO));
}

// ─── Lectura reactiva (para useSyncExternalStore) ────────────────────────────

let crudoPrevio: string | null = null;
let perfilPrevio: UsuarioPerfil | null = null;

/** Devuelve siempre el mismo objeto mientras la sesión guardada no cambie. */
export function leerSesion(): UsuarioPerfil | null {
  let crudo: string | null = null;
  try {
    crudo = localStorage.getItem(CLAVE_SESION);
  } catch {
    return null;
  }
  if (crudo !== crudoPrevio) {
    crudoPrevio = crudo;
    try {
      perfilPrevio = crudo ? JSON.parse(crudo) as UsuarioPerfil : null;
    } catch {
      perfilPrevio = null;
    }
  }
  return perfilPrevio;
}

export function suscribirSesion(avisar: () => void): () => void {
  window.addEventListener(EVENTO, avisar);
  // Entrar o salir en otra pestaña también cuenta.
  window.addEventListener('storage', avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener('storage', avisar);
  };
}
