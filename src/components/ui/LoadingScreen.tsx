import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function LoadingScreen({ mensaje = 'Cargando...' }: { mensaje?: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 12,
      }}
    >
      <CircularProgress size={36} thickness={3} />
      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
        {mensaje}
      </Typography>
    </Box>
  );
}
