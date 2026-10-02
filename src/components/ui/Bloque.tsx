'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import { bloque, cifra } from './estilos';
import { useConteo } from '@/hooks/useConteo';

interface Props {
  /** Una palabra. */
  titulo: string;
  valor: number;
  icono: React.ReactNode;
  href: string;
  /** Color de fondo; sin él el bloque es blanco. */
  tono?: string;
  /** El ícono se mueve para pedir atención (algo falta, algo espera). */
  atencion?: boolean;
  orden?: number;
}

/** Un número grande, un ícono y una palabra, que llevan a su sección. */
export default function Bloque({ titulo, valor, icono, href, tono, atencion, orden = 0 }: Props) {
  const conteo = useConteo(valor);

  return (
    <Box
      component={Link}
      href={href}
      className="in"
      style={{ '--n': orden } as React.CSSProperties}
      sx={{
        ...bloque,
        display: 'grid', gap: '0.25rem', p: '1.25rem',
        ...(tono && { backgroundColor: tono, color: 'var(--on-tint)' }),
        '& svg': { fontSize: '2.4rem', ...(atencion && { animation: 'wobble 1.5s ease-in-out infinite' }) },
      }}
    >
      {icono}
      <Box component="b" sx={{ ...cifra, fontSize: 'clamp(2.2rem, 6vw, 3.4rem)' }}>{conteo}</Box>
      <Box component="span" sx={{ fontWeight: 800 }}>{titulo}</Box>
    </Box>
  );
}
