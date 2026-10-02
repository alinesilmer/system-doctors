'use client';

import PantallaAcceso from '@/components/auth/PantallaAcceso';
import { useAuth } from '@/contexts/AuthContext';
import { CREDENCIAL_DEMO } from '@/lib/auth/sesion';

export default function LoginPage() {
  const { iniciarSesion } = useAuth();

  return (
    <PantallaAcceso
      titulo="Hola"
      accion="Entrar"
      campos={[
        { nombre: 'email', label: 'Email', tipo: 'email', autoComplete: 'email' },
        { nombre: 'password', label: 'Contraseña', tipo: 'password', autoComplete: 'current-password' },
      ]}
      // Al entrar, `AppShell` lleva al inicio.
      onEnviar={({ email = '', password = '' }) => iniciarSesion(email, password)}
      alternativa={{ texto: 'Crear cuenta', href: '/registro' }}
      demo={{
        etiqueta: 'Usar cuenta demo',
        valores: { email: CREDENCIAL_DEMO.email, password: CREDENCIAL_DEMO.password },
      }}
    />
  );
}
