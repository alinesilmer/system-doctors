'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Box from '@mui/material/Box';

interface ConfirmarDialogoProps {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  textoConfirmar?: string;
  cargando?: boolean;
  /** Fallo de la acción confirmada; se muestra sin cerrar el diálogo. */
  error?: string | null;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmarDialogo({
  abierto,
  titulo,
  descripcion,
  textoConfirmar = 'Confirmar',
  cargando = false,
  error,
  onConfirmar,
  onCancelar,
}: ConfirmarDialogoProps) {
  return (
    <Dialog open={abierto} onClose={onCancelar} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'var(--sun)',
              color: 'var(--on-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <WarningAmberOutlinedIcon sx={{ fontSize: 26, animation: 'wobble 1.5s ease-in-out infinite' }} />
          </Box>
          {titulo}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'var(--soft)', mt: 0.5 }}>
          {descripcion}
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onCancelar} disabled={cargando} sx={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirmar}
          disabled={cargando}
          sx={{ flex: 1 }}
        >
          {cargando ? 'Procesando...' : textoConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
