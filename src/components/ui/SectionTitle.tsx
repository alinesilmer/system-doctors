import Box from '@mui/material/Box';
import { rotulo } from './estilos';

/** Encabezado de una sección dentro de una tarjeta de formulario. */
export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ ...rotulo, pb: 1, mb: 2, borderBottom: '3px dotted var(--line)' }}>
      {children}
    </Box>
  );
}
