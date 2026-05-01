'use client';

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
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmarDialogo({
  abierto,
  titulo,
  descripcion,
  textoConfirmar = 'Confirmar',
  cargando = false,
  onConfirmar,
  onCancelar,
}: ConfirmarDialogoProps) {
  return (
    <Dialog open={abierto} onClose={onCancelar} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <WarningAmberOutlinedIcon sx={{ color: '#D97706', fontSize: 22 }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#0F172A' }}>
            {titulo}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          {descripcion}
        </Typography>
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
