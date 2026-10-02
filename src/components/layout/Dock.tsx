'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { DOCK, itemActivo } from './navegacion';
import { Vara } from '@/components/ui/Mascota';
import { useAuth } from '@/contexts/AuthContext';
import { useAvisos } from '@/hooks/useAvisos';

const boton = {
  position: 'relative',
  width: '3.2rem',
  height: '3.2rem',
  flexShrink: 0,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  color: 'var(--soft)',
  transition: 'transform 0.25s var(--spring), background-color 0.2s, color 0.2s',
  '&:hover': { backgroundColor: 'var(--bg)', color: 'var(--ink)', transform: 'scale(1.14)' },
} as const;

/**
 * Navegación principal: una píldora flotante de íconos. En pantallas angostas
 * pasa a ser una barra fija abajo, al alcance del pulgar.
 */
export default function Dock() {
  const pathname = usePathname();
  const { perfil } = useAuth();
  const avisos = useAvisos();
  const activo = itemActivo(pathname);

  return (
    <Box
      component="nav"
      aria-label="Menú principal"
      sx={{
        position: 'fixed', zIndex: 100,
        top: { xs: 'auto', md: 0 }, bottom: 0, left: 0, right: { xs: 0, md: 'auto' },
        p: { xs: '0 0.75rem 0.75rem', md: '1.25rem 0 1.25rem 1.25rem' },
      }}
    >
      <Box
        sx={{
          height: { md: '100%' },
          display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: 'center',
          justifyContent: { xs: 'space-between', md: 'flex-start' },
          gap: '0.5rem', p: '0.7rem', borderRadius: '999px',
          backgroundColor: 'var(--card)', boxShadow: 'var(--shadow)', overflowX: { xs: 'auto', md: 'visible' },
        }}
      >
        {/* Marca: sólo donde hay lugar (dock vertical). */}
        <Box
          component={Link}
          href="/inicio"
          aria-label="MediSystem"
          sx={{ display: { xs: 'none', md: 'block' }, mb: '0.5rem', pb: '0.75rem', borderBottom: '3px dotted var(--line)', transition: 'transform 0.3s var(--spring)', '&:hover': { transform: 'rotate(-8deg) scale(1.08)' } }}
        >
          <Vara />
        </Box>

        {DOCK.map(({ label, href, icon: Icon, aviso }) => {
          const esActivo = href === activo;
          const cantidad = aviso ? avisos[aviso] : 0;
          return (
            <Tooltip key={href} title={label} placement="right">
              <Box
                component={Link}
                href={href}
                aria-label={cantidad ? `${label}, ${cantidad}` : label}
                aria-current={esActivo ? 'page' : undefined}
                sx={{
                  ...boton,
                  ...(esActivo && {
                    backgroundColor: 'var(--solid)', color: 'var(--on-solid)',
                    '&:hover': { backgroundColor: 'var(--solid)', color: 'var(--on-solid)', transform: 'scale(1.08)' },
                  }),
                }}
              >
                <Icon />
                {cantidad > 0 && (
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute', top: '0.1rem', right: '0.1rem', minWidth: '1.15rem', height: '1.15rem', px: '0.25rem',
                      borderRadius: '999px', backgroundColor: 'var(--pink)', color: 'var(--on-accent)',
                      fontSize: '0.68rem', fontWeight: 800, display: 'grid', placeItems: 'center',
                    }}
                  >
                    {cantidad > 99 ? '99+' : cantidad}
                  </Box>
                )}
              </Box>
            </Tooltip>
          );
        })}

        <Tooltip title="Mi cuenta" placement="right">
          <Box
            component={Link}
            href="/cuenta"
            aria-label="Mi cuenta"
            sx={{
              ...boton,
              mt: { md: 'auto' },
              backgroundColor: 'var(--pink)', color: 'var(--on-accent)',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', textDecoration: 'none',
              outline: pathname.startsWith('/cuenta') ? '3px solid var(--ink)' : 'none', outlineOffset: '3px',
              '&:hover': { transform: 'scale(1.14)' },
            }}
          >
            {perfil?.nombre?.[0]?.toUpperCase() ?? '?'}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
}
