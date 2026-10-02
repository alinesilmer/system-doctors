import Box from '@mui/material/Box';
import { DISPLAY } from './estilos';

export type EstadoParada = 'hecha' | 'sigue' | 'pendiente';

/**
 * Una lista dibujada como camino vertical: cada elemento es una parada sobre la
 * línea. El tramo recorrido es sólido, el que falta punteado, y la parada que
 * sigue late. Sirve igual para la agenda de un día que para una historia clínica.
 */
export function Camino({ children }: { children: React.ReactNode }) {
  return (
    <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Box>
  );
}

interface ParadaProps {
  estado?: EstadoParada;
  /** Texto a la izquierda del contenido: una hora, una fecha corta. */
  marca?: string;
  /** Círculo con ícono, en lugar de la marca o además de ella. */
  icono?: React.ReactNode;
  tono?: string;
  titulo: React.ReactNode;
  detalle?: React.ReactNode;
  /** Lo que va al final de la fila: una etiqueta, acciones. */
  fin?: React.ReactNode;
  /** Posición en la lista, para escalonar la entrada. */
  orden?: number;
}

export function Parada({ estado = 'pendiente', marca, icono, tono = 'var(--lila)', titulo, detalle, fin, orden = 0 }: ParadaProps) {
  const hecha = estado === 'hecha';
  const sigue = estado === 'sigue';

  return (
    <Box
      component="li"
      className="in"
      style={{ '--n': orden } as React.CSSProperties}
      sx={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        py: '0.85rem', pl: '3.2rem',
        // La línea del camino.
        '&::before': {
          content: '""', position: 'absolute', left: '1.05rem', top: 0, bottom: 0,
          borderLeft: hecha ? '6px solid var(--ink)' : '6px dotted var(--line)',
        },
        '&:first-of-type::before': { top: '50%' },
        '&:last-of-type::before': { bottom: '50%' },
        // La parada.
        '&::after': {
          content: '""', position: 'absolute', left: '0.45rem', top: '50%', width: '1.5rem', height: '1.5rem',
          mt: '-0.75rem', borderRadius: '50%', transition: 'transform 0.25s var(--spring)',
          border: `5px solid ${sigue ? 'var(--pink)' : 'var(--ink)'}`,
          backgroundColor: sigue ? 'var(--pink)' : hecha ? 'var(--ink)' : 'var(--card)',
          ...(sigue && {
            color: 'color-mix(in srgb, var(--pink) 55%, transparent)',
            animation: 'ping 1.6s infinite',
          }),
        },
        '&:hover::after': { transform: 'scale(1.25)' },
      }}
    >
      {marca && (
        <Box
          component="time"
          sx={{
            fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.3rem', width: '4rem', flexShrink: 0,
            fontVariantNumeric: 'tabular-nums', color: hecha ? 'var(--soft)' : 'var(--ink)',
          }}
        >
          {marca}
        </Box>
      )}
      {icono && (
        <Box
          sx={{
            width: '2.6rem', height: '2.6rem', flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
            backgroundColor: tono, color: 'var(--on-tint)', '& svg': { fontSize: '1.3rem' },
          }}
        >
          {icono}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: '8rem' }}>
        <Box sx={{ fontWeight: 800, color: hecha ? 'var(--soft)' : 'var(--ink)' }}>{titulo}</Box>
        {detalle && <Box sx={{ color: 'var(--soft)', fontSize: '0.9rem' }}>{detalle}</Box>}
      </Box>
      {fin}
    </Box>
  );
}
