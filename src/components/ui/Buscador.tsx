'use client';

import Box from '@mui/material/Box';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Etiqueta from './Etiqueta';
import { flotante } from './estilos';

interface Props {
  valor: string;
  onCambio: (valor: string) => void;
  /** Dos o tres palabras: "Nombre o DNI". */
  ayuda: string;
  /** Cuántos resultados quedan a la vista. */
  cantidad?: number;
}

/** Búsqueda de una pantalla: una sola píldora grande que filtra mientras se escribe. */
export default function Buscador({ valor, onCambio, ayuda, cantidad }: Props) {
  return (
    <Box
      component="label"
      className="in"
      style={{ '--n': 1 } as React.CSSProperties}
      sx={{
        ...flotante, borderRadius: '999px',
        display: 'flex', alignItems: 'center', gap: 1.5, p: '0.35rem 0.6rem 0.35rem 1.3rem', maxWidth: '34rem',
        '&:focus-within': { outline: '3px solid var(--pink)' },
      }}
    >
      <SearchRoundedIcon />
      <Box
        component="input"
        type="search"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        placeholder={ayuda}
        aria-label={ayuda}
        autoComplete="off"
        sx={{
          flex: 1, minWidth: 0, border: 0, outline: 0, background: 'none', color: 'inherit',
          font: 'inherit', fontWeight: 800, fontSize: '1.05rem', py: '0.8rem',
          '&::placeholder': { color: 'var(--soft)', fontWeight: 500 },
        }}
      />
      {cantidad !== undefined && <Etiqueta>{cantidad}</Etiqueta>}
    </Box>
  );
}
