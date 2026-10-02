'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import type { User } from 'firebase/auth';
import Splash, { type FaseSplash } from '@/components/layout/Splash';
import { cambiarClave, entrar, leerSesion, registrar, renombrar, salir, suscribirSesion } from '@/lib/auth/sesion';
import { vaciarCache } from '@/lib/api/cliente';
import type { UsuarioPerfil, RolUsuario } from '@/lib/firestore/usuarios';

// Sesión de demostración (ver `lib/auth/sesion.ts`). Al conectar Firebase Auth
// cambian las cuatro funciones importadas de ahí; este contexto y sus
// consumidores quedan igual.

interface AuthContextValue {
  user: User | null;
  perfil: UsuarioPerfil | null;
  rol: RolUsuario | null;
  /** Todavía no se sabe si hay sesión (primer render, antes de leer el navegador). */
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  crearCuenta: (nombre: string, email: string, password: string) => Promise<void>;
  cambiarNombre: (nombre: string) => Promise<void>;
  cambiarContrasena: (actual: string, nueva: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Cuánto se ve el splash antes de desvanecerse, y cuánto dura el desvanecido. */
const SPLASH_MS = 800;
const SALIDA_MS = 400;

// El formulario público que completa un paciente no es "abrir la app": sin splash.
const SIN_SPLASH = ['/registro-paciente'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // `undefined` en el servidor y durante la hidratación: aún no se leyó el navegador.
  const sesion = useSyncExternalStore<UsuarioPerfil | null | undefined>(suscribirSesion, leerSesion, () => undefined);

  const [fase, setFase] = useState<FaseSplash>('visible');
  const [texto, setTexto] = useState<string | null>(null); // null = splash de apertura
  const relojes = useRef<ReturnType<typeof setTimeout>[]>([]);

  const programarSalida = useCallback(() => {
    relojes.current.forEach(clearTimeout);
    relojes.current = [
      setTimeout(() => setFase('saliendo'), SPLASH_MS),
      setTimeout(() => setFase('oculto'), SPLASH_MS + SALIDA_MS),
    ];
  }, []);

  // Al abrir la app.
  useEffect(() => {
    programarSalida();
    const pendientes = relojes;
    return () => pendientes.current.forEach(clearTimeout);
  }, [programarSalida]);

  /** Al entrar: el mismo splash, saludando por el nombre. */
  const saludar = useCallback((perfil: UsuarioPerfil) => {
    setTexto(`Hola, ${perfil.nombre}`);
    setFase('visible');
    programarSalida();
  }, [programarSalida]);

  const valor = useMemo<AuthContextValue>(() => ({
    user: null,
    perfil: sesion ?? null,
    rol: sesion?.rol ?? null,
    cargando: sesion === undefined,
    iniciarSesion: async (email, password) => saludar(await entrar(email, password)),
    crearCuenta: async (nombre, email, password) => saludar(await registrar(nombre, email, password)),
    cambiarNombre: async (nombre) => renombrar(nombre),
    cambiarContrasena: cambiarClave,
    cerrarSesion: async () => { vaciarCache(); salir(); },
  }), [sesion, saludar]);

  const conSplash = !SIN_SPLASH.some((r) => pathname.startsWith(r));

  return (
    <AuthContext.Provider value={valor}>
      {children}
      {conSplash && <Splash fase={fase} texto={texto ?? 'MediSystem'} inicial={texto === null} />}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
