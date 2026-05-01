import Chip from '@mui/material/Chip';
import type { EstadoTurno } from '@/lib/types';

const CONFIG: Record<EstadoTurno, { label: string; color: string; bg: string }> = {
  pendiente:   { label: 'Pendiente',   color: '#92400E', bg: '#FEF3C7' },
  confirmado:  { label: 'Confirmado',  color: '#065F46', bg: '#D1FAE5' },
  cancelado:   { label: 'Cancelado',   color: '#991B1B', bg: '#FEE2E2' },
  completado:  { label: 'Completado',  color: '#1E40AF', bg: '#DBEAFE' },
  no_asistio:  { label: 'No asistió',  color: '#374151', bg: '#F3F4F6' },
};

export default function EstadoChip({ estado }: { estado: EstadoTurno }) {
  const cfg = CONFIG[estado] ?? CONFIG.pendiente;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 22,
        border: 'none',
      }}
    />
  );
}
