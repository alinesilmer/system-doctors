import Box from '@mui/material/Box';
import LineaDePulso from './LineaDePulso';

/** Espera: un pulso que recorre la línea de signos vitales. */
export default function LoadingScreen({ mensaje = 'Cargando' }: { mensaje?: string }) {
  return (
    <Box role="status" sx={{ display: 'grid', justifyItems: 'center', gap: 1.5, py: 10 }}>
      <LineaDePulso />
      <Box sx={{ color: 'var(--soft)', fontWeight: 800 }}>{mensaje.replace(/\.+$/, '')}</Box>
    </Box>
  );
}
