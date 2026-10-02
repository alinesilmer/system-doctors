'use client';

import Box from '@mui/material/Box';

export interface OpcionFiltro {
  valor: string;
  label: string;
}

interface Props {
  opciones: OpcionFiltro[];
  valor: string;
  onCambio: (valor: string) => void;
  /** Para lectores de pantalla: qué se está filtrando. */
  nombre: string;
}

/** Filtro de una sola elección como fila de píldoras: se ve todo de un vistazo, sin abrir un menú. */
export default function Filtros({ opciones, valor, onCambio, nombre }: Props) {
  return (
    <Box role="group" aria-label={nombre} sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
      {opciones.map((o) => {
        const elegido = o.valor === valor;
        return (
          <Box
            key={o.valor}
            component="button"
            onClick={() => onCambio(o.valor)}
            aria-pressed={elegido}
            sx={{
              px: 1.75, py: 0.75, borderRadius: '999px', border: 0, cursor: 'pointer', font: 'inherit', fontWeight: 800, fontSize: '0.85rem',
              backgroundColor: elegido ? 'var(--solid)' : 'var(--card)', color: elegido ? 'var(--on-solid)' : 'var(--soft)',
              transition: 'transform 0.2s var(--spring), background-color 0.2s, color 0.2s',
              '&:hover': { transform: 'translateY(-3px)', color: elegido ? 'var(--on-solid)' : 'var(--ink)' },
            }}
          >
            {o.label}
          </Box>
        );
      })}
    </Box>
  );
}
