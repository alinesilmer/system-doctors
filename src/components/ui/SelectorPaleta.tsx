'use client';

import { useSyncExternalStore } from 'react';
import Box from '@mui/material/Box';
import { PALETAS, aplicarPaleta, paletaGuardada, type PaletaId } from '@/lib/paletas';

// La paleta vive en <html data-p>; el selector se entera de los cambios por un evento propio.
const EVENTO = 'paleta';
const suscribir = (avisar: () => void) => {
  window.addEventListener(EVENTO, avisar);
  return () => window.removeEventListener(EVENTO, avisar);
};

/** Cambia los colores de toda la aplicación; la elección queda guardada en este navegador. */
export default function SelectorPaleta() {
  const actual = useSyncExternalStore<PaletaId>(suscribir, paletaGuardada, () => 'cielo');

  function elegir(id: PaletaId) {
    aplicarPaleta(id);
    window.dispatchEvent(new Event(EVENTO));
  }

  return (
    <Box role="group" aria-label="Colores" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {PALETAS.map(({ id, nombre, muestra: [fondo, acento, tinta] }) => {
        const elegida = id === actual;
        return (
          <Box
            key={id}
            component="button"
            onClick={() => elegir(id)}
            aria-pressed={elegida}
            sx={{
              display: 'grid', justifyItems: 'center', gap: 0.75, p: 0, border: 0, background: 'none', cursor: 'pointer',
              font: 'inherit', fontWeight: 800, color: elegida ? 'var(--ink)' : 'var(--soft)',
              '&:hover > span': { transform: 'scale(1.12) rotate(20deg)' },
            }}
          >
            <Box
              component="span"
              sx={{
                width: '3.6rem', height: '3.6rem', borderRadius: '50%',
                background: `conic-gradient(${fondo} 0 33%, ${acento} 0 66%, ${tinta} 0)`,
                outline: elegida ? '3px solid var(--ink)' : '3px solid var(--line)', outlineOffset: '3px',
                transition: 'transform 0.25s var(--spring)',
              }}
            />
            {nombre}
          </Box>
        );
      })}
    </Box>
  );
}
