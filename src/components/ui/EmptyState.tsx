'use client';

import Box from '@mui/material/Box';
import { DISPLAY } from './estilos';
import Pildora from './Pildora';

interface EmptyStateProps {
  titulo: string;
  descripcion?: string;
  icono?: React.ReactNode;
  /** Dibujo que reemplaza al ícono en círculo (la mascota, por ejemplo). */
  ilustracion?: React.ReactNode;
  accion?: { label: string; onClick: () => void };
}

/** Pantalla o lista sin datos: un ícono grande, pocas palabras y qué hacer ahora. */
export default function EmptyState({ titulo, descripcion, icono, ilustracion, accion }: EmptyStateProps) {
  return (
    <Box className="in" sx={{ display: 'grid', justifyItems: 'center', gap: 1.5, py: 8, textAlign: 'center' }}>
      {ilustracion}
      {!ilustracion && icono && (
        <Box
          sx={{
            width: '6rem', height: '6rem', borderRadius: '50%', display: 'grid', placeItems: 'center',
            backgroundColor: 'var(--lila)', color: 'var(--on-tint)', fontSize: '2.8rem',
            animation: 'hop 2.4s ease-in-out infinite',
          }}
        >
          {icono}
        </Box>
      )}
      <Box sx={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.6rem', lineHeight: 1.1 }}>{titulo}</Box>
      {descripcion && <Box sx={{ color: 'var(--soft)', maxWidth: '22rem' }}>{descripcion}</Box>}
      {accion && <Box sx={{ mt: 1 }}><Pildora onClick={accion.onClick}>{accion.label}</Pildora></Box>}
    </Box>
  );
}
