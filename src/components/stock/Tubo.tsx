'use client';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { cifra } from '@/components/ui/estilos';
import TuboNivel from '@/components/ui/TuboNivel';
import type { ItemStock } from '@/lib/types';

export type NivelStock = 'bien' | 'bajo' | 'agotado';

export function nivelDe(item: ItemStock): NivelStock {
  if (item.cantidad <= 0) return 'agotado';
  return item.cantidad <= item.cantidadMinima ? 'bajo' : 'bien';
}

interface Props {
  item: ItemStock;
  /** Suma o resta una unidad. */
  onAjustar: (item: ItemStock, delta: 1 | -1) => void;
  /** Abre el detalle (movimiento con cantidad y motivo, editar, eliminar). */
  onAbrir: (item: ItemStock) => void;
  ocupado?: boolean;
  orden?: number;
}

const paso = {
  width: '2.3rem', height: '2.3rem', borderRadius: '50%', border: 0, cursor: 'pointer',
  display: 'grid', placeItems: 'center', backgroundColor: 'var(--bg)', color: 'var(--ink)',
  transition: 'transform 0.2s var(--spring), background-color 0.2s, color 0.2s',
  '&:hover:not(:disabled)': { backgroundColor: 'var(--solid)', color: 'var(--on-solid)', transform: 'scale(1.15)' },
  '&:disabled': { opacity: 0.35, cursor: 'default' },
} as const;

/**
 * Un insumo como tubo de ensayo: se llena hasta su nivel, con una línea
 * punteada en el mínimo. Bajo el mínimo cambia de tono; vacío, se sacude.
 */
export default function Tubo({ item, onAjustar, onAbrir, ocupado, orden = 0 }: Props) {
  const nivel = nivelDe(item);
  // El tubo "lleno" equivale a tres veces el mínimo, o a lo que haya si es más.
  const tope = Math.max(item.cantidadMinima * 3, item.cantidad, 1);
  const altura = Math.min(100, (item.cantidad / tope) * 100);
  const minimo = (item.cantidadMinima / tope) * 100;

  return (
    <Box
      className="in"
      style={{ '--n': Math.min(orden, 12) } as React.CSSProperties}
      sx={{
        display: 'grid', justifyItems: 'center', gap: 1, p: 2, textAlign: 'center',
        backgroundColor: 'var(--card)', borderRadius: '1.75rem',
        transition: 'transform 0.25s var(--spring)', '&:hover': { transform: 'translateY(-5px)' },
      }}
    >
      <Tooltip title="Movimiento, editar">
        {/* El envoltorio recibe el tooltip; la línea punteada marca el mínimo. */}
        <Box sx={{ display: 'grid' }}>
          <TuboNivel
            nivel={altura}
            marca={minimo}
            tono={nivel === 'bien' ? 'var(--mint)' : 'var(--sun)'}
            agitar={nivel === 'agotado'}
            onClick={() => onAbrir(item)}
            etiqueta={`Abrir ${item.nombre}`}
          />
        </Box>
      </Tooltip>

      <Box sx={{ ...cifra, fontSize: '1.7rem', color: nivel === 'bien' ? 'var(--ink)' : 'var(--pink)' }}>{item.cantidad}</Box>
      <Box sx={{ fontWeight: 800, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{item.nombre}</Box>
      <Box sx={{ color: 'var(--soft)', fontSize: '0.8rem', mt: -0.75 }}>{item.unidad}</Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box component="button" aria-label={`Quitar uno de ${item.nombre}`} disabled={ocupado || item.cantidad <= 0} onClick={() => onAjustar(item, -1)} sx={paso}>
          <RemoveRoundedIcon fontSize="small" />
        </Box>
        <Box component="button" aria-label={`Agregar uno a ${item.nombre}`} disabled={ocupado} onClick={() => onAjustar(item, 1)} sx={paso}>
          <AddRoundedIcon fontSize="small" />
        </Box>
      </Box>
    </Box>
  );
}
