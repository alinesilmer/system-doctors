import Box from '@mui/material/Box';
import { DISPLAY, tonoDe } from './estilos';

interface Props {
  /** Nombre completo; de él salen las iniciales y el tono. */
  nombre: string;
  /** Lado del círculo, en rem. */
  tam?: number;
}

function iniciales(nombre: string): string {
  // "Rodríguez, Carla" y "Carla Rodríguez" dan las mismas dos letras.
  const partes = nombre.replace(',', ' ').split(/\s+/).filter(Boolean);
  return partes.slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';
}

export default function AvatarIniciales({ nombre, tam = 3.4 }: Props) {
  return (
    <Box
      aria-hidden
      sx={{
        width: `${tam}rem`, height: `${tam}rem`, flexShrink: 0, borderRadius: '50%',
        display: 'grid', placeItems: 'center',
        backgroundColor: tonoDe(nombre), color: 'var(--on-tint)',
        fontFamily: DISPLAY, fontWeight: 800, fontSize: `${tam * 0.34}rem`,
      }}
    >
      {iniciales(nombre)}
    </Box>
  );
}
