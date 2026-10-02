'use client';

import Box from '@mui/material/Box';
import { Vara } from '@/components/ui/Mascota';
import LineaDePulso from '@/components/ui/LineaDePulso';
import { DISPLAY } from '@/components/ui/estilos';

export type FaseSplash = 'visible' | 'saliendo' | 'oculto';

interface Props {
  fase: FaseSplash;
  /** Texto bajo la marca: el nombre de la app al abrir, un saludo al entrar. */
  texto: string;
  /** Es el de apertura (no el saludo tras entrar): se muestra una sola vez por pestaña. */
  inicial?: boolean;
}

/**
 * Pantalla de presentación. Es una capa por encima de la aplicación, no una
 * espera: debajo la página ya está cargando sus datos, así que el splash no
 * agrega demora real.
 */
export default function Splash({ fase, texto, inicial }: Props) {
  if (fase === 'oculto') return null;

  return (
    <Box
      role="status"
      aria-label="Abriendo MediSystem"
      className={inicial ? 'splash-inicial' : undefined}
      sx={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'grid', placeContent: 'center', justifyItems: 'center', gap: 2,
        backgroundColor: 'var(--bg)',
        opacity: fase === 'saliendo' ? 0 : 1,
        pointerEvents: fase === 'saliendo' ? 'none' : 'auto',
        transition: 'opacity 0.4s ease',
        '@keyframes llegar': { from: { opacity: 0, transform: 'scale(0.7) rotate(-12deg)' }, to: { opacity: 1, transform: 'none' } },
      }}
    >
      <Box sx={{ animation: 'llegar 0.6s var(--spring) both' }}>
        <Vara tam={7} />
      </Box>
      <Box className="in" style={{ '--n': 2 } as React.CSSProperties} sx={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.8rem, 6vw, 2.6rem)', lineHeight: 1, textAlign: 'center', px: 2 }}>
        {texto}
        <Box component="span" sx={{ color: 'var(--pink)' }}>.</Box>
      </Box>
      <Box className="in" style={{ '--n': 4 } as React.CSSProperties}>
        <LineaDePulso ancho={8} />
      </Box>
    </Box>
  );
}
