'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { redondoClaro } from './estilos';

interface PageContainerProps {
  titulo: React.ReactNode;
  /** Ilustración pequeña a la izquierda del título. */
  icono?: React.ReactNode;
  subtitulo?: string;
  acciones?: React.ReactNode;
  /** Ruta a la que vuelve el botón "atrás"; sin ella no se muestra. */
  volver?: string;
  children: React.ReactNode;
}

/** Marco de toda pantalla: un título grande, a lo sumo una línea debajo y las acciones. */
export default function PageContainer({ titulo, icono, subtitulo, acciones, volver, children }: PageContainerProps) {
  return (
    <Box sx={{ px: 'clamp(1rem, 4vw, 3.5rem)', pt: 'clamp(1.25rem, 3vw, 2.5rem)', pb: '4rem', maxWidth: '78rem' }}>
      <Box
        component="header"
        className="in"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          {volver && (
            <Box component={Link} href={volver} aria-label="Volver" sx={redondoClaro}>
              <ArrowBackRoundedIcon />
            </Box>
          )}
          {icono}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h1" sx={{ textWrap: 'balance' }}>
              {titulo}
              <Box component="span" sx={{ color: 'var(--pink)' }}>.</Box>
            </Typography>
            {subtitulo && (
              <Typography sx={{ color: 'var(--soft)', fontWeight: 800, mt: 0.5 }}>{subtitulo}</Typography>
            )}
          </Box>
        </Box>
        {acciones && <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>{acciones}</Box>}
      </Box>
      {children}
    </Box>
  );
}
