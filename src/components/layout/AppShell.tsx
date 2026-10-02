'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Dock from './Dock';
import { useAuth } from '@/contexts/AuthContext';

/** Pantallas de acceso: sólo para quien todavía no entró. */
const ACCESO = ['/login', '/registro'];
/** Pantallas abiertas a cualquiera, con o sin sesión. */
const PUBLICAS = ['/registro-paciente', '/recuperar-contrasena'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { perfil, cargando } = useAuth();

  const esAcceso = ACCESO.includes(pathname);
  const esPublica = PUBLICAS.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (cargando || esPublica) return;
    if (!perfil && !esAcceso) router.replace('/login');
    if (perfil && esAcceso) router.replace('/inicio');
  }, [cargando, perfil, esAcceso, esPublica, router]);

  if (esPublica) return <>{children}</>;
  // Mientras se resuelve la sesión o la redirección, el splash cubre la pantalla.
  if (esAcceso) return perfil ? null : <>{children}</>;
  if (!perfil) return null;

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Dock />
      <Box
        component="main"
        sx={{
          // En escritorio el dock va a la izquierda; en el teléfono, abajo.
          ml: { xs: 0, md: 'var(--dock-width)' },
          pb: { xs: '6rem', md: 0 },
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
