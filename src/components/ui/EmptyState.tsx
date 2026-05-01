import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

interface EmptyStateProps {
  titulo: string;
  descripcion?: string;
  icono?: React.ReactNode;
  accion?: { label: string; onClick: () => void };
}

export default function EmptyState({ titulo, descripcion, icono, accion }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        gap: 2,
        color: '#94A3B8',
      }}
    >
      {icono && (
        <Box sx={{ fontSize: 56, opacity: 0.4, lineHeight: 1 }}>{icono}</Box>
      )}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#475569', mb: 0.5 }}>
          {titulo}
        </Typography>
        {descripcion && (
          <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 320 }}>
            {descripcion}
          </Typography>
        )}
      </Box>
      {accion && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={accion.onClick}
          sx={{ mt: 1 }}
        >
          {accion.label}
        </Button>
      )}
    </Box>
  );
}
