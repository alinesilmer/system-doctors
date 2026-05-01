'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Sidebar from './Sidebar';

const NO_SIDEBAR_ROUTES = ['/login', '/registro', '/recuperar-contrasena', '/registro-paciente'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isPublic = NO_SIDEBAR_ROUTES.some((r) => pathname.startsWith(r));

  if (isPublic) return <>{children}</>;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {mounted && <Sidebar />}
      <Box
        component="main"
        sx={{
          flex: 1,
          marginLeft: mounted ? 'var(--sidebar-width)' : 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'margin-left 0.15s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
