'use client';

import PantallaAcceso from '@/components/auth/PantallaAcceso';
import { useAuth } from '@/contexts/AuthContext';

export default function RegistroPage() {
  const { crearCuenta } = useAuth();

  return (
    <PantallaAcceso
      titulo="Crear cuenta"
      accion="Empezar"
      campos={[
        { nombre: 'nombre', label: 'Nombre', autoComplete: 'name' },
        { nombre: 'email', label: 'Email', tipo: 'email', autoComplete: 'email' },
        { nombre: 'password', label: 'Contraseña', tipo: 'password', autoComplete: 'new-password' },
      ]}
      onEnviar={({ nombre = '', email = '', password = '' }) => crearCuenta(nombre, email, password)}
      alternativa={{ texto: 'Ya tengo cuenta', href: '/login' }}
    />
  );
}
