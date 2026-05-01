'use client';

// AUTH TEMPORARILY DISABLED — bypass for development
// To restore: re-implement onAuthStateChanged flow

import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
import type { UsuarioPerfil, RolUsuario } from '@/lib/firestore/usuarios';

const MOCK_PERFIL: UsuarioPerfil = {
  uid: 'dev-user',
  email: 'dev@medisystem.local',
  nombre: 'Dev Admin',
  rol: 'admin',
  cuentaId: 'dev',
  activo: true,
  creadoEn: new Date().toISOString(),
};

interface AuthContextValue {
  user: User | null;
  perfil: UsuarioPerfil | null;
  rol: RolUsuario | null;
  cargando: boolean;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  perfil: MOCK_PERFIL,
  rol: 'admin',
  cargando: false,
  cerrarSesion: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{
      user: null,
      perfil: MOCK_PERFIL,
      rol: 'admin',
      cargando: false,
      cerrarSesion: async () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
