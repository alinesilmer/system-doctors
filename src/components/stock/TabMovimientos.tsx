'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TuneIcon from '@mui/icons-material/Tune';
import { useColeccion } from '@/hooks/useRecurso';
import type { MovimientoStock } from '@/lib/types';

function TipoChip({ tipo }: { tipo: MovimientoStock['tipo'] }) {
  if (tipo === 'entrada')
    return <Chip icon={<TrendingUpIcon sx={{ fontSize: '14px !important' }} />} label="Entrada" size="small" sx={{ backgroundColor: 'color-mix(in srgb, var(--ok) 18%, transparent)', color: 'var(--ok)', fontWeight: 600 }} />;
  if (tipo === 'salida')
    return <Chip icon={<TrendingDownIcon sx={{ fontSize: '14px !important' }} />} label="Salida" size="small" sx={{ backgroundColor: 'color-mix(in srgb, var(--bad) 16%, transparent)', color: 'var(--bad)', fontWeight: 600 }} />;
  return <Chip icon={<TuneIcon sx={{ fontSize: '14px !important' }} />} label="Ajuste" size="small" sx={{ backgroundColor: 'var(--lila)', color: 'var(--ink)', fontWeight: 600 }} />;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TabMovimientos() {
  const { items: movimientos, cargando, error } = useColeccion<MovimientoStock>(
    '/api/stock/movimientos',
    'Error al cargar movimientos',
  );

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  if (movimientos.length === 0) {
    return (
      <Alert severity="info">No hay movimientos registrados aún. Los movimientos aparecen aquí cuando registrás entradas, salidas o ajustes de stock.</Alert>
    );
  }

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--ink)' }}>Historial de movimientos</Typography>
        <Chip label={movimientos.length} size="small" sx={{ ml: 'auto', backgroundColor: 'var(--bg)', color: 'var(--soft)', fontWeight: 700 }} />
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'var(--bg)' }}>
              <TableCell sx={{ fontWeight: 700, color: 'var(--soft)' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--soft)' }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--soft)' }}>Tipo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--soft)' }}>Cantidad</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--soft)' }}>Anterior</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--soft)' }}>Nueva</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--soft)' }}>Motivo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimientos.map((m) => (
              <TableRow key={m.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>
                  <Typography variant="caption" sx={{ color: 'var(--soft)', whiteSpace: 'nowrap' }}>{formatFecha(m.creadoEn)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>{m.itemNombre ?? m.itemId}</Typography>
                </TableCell>
                <TableCell><TipoChip tipo={m.tipo} /></TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 700, color: m.tipo === 'entrada' ? 'var(--ok)' : m.tipo === 'salida' ? 'var(--bad)' : 'var(--ink)' }}>
                    {m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '-' : '='}{m.cantidad}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ color: 'var(--soft)' }}>{m.cantidadAnterior}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.cantidadNueva}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: m.motivo ? 'var(--soft)' : 'var(--line)' }}>{m.motivo || '—'}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
