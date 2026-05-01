'use client';

import { useState, useEffect } from 'react';
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
import type { MovimientoStock } from '@/lib/types';

function TipoChip({ tipo }: { tipo: MovimientoStock['tipo'] }) {
  if (tipo === 'entrada')
    return <Chip icon={<TrendingUpIcon sx={{ fontSize: '14px !important' }} />} label="Entrada" size="small" sx={{ backgroundColor: '#D1FAE5', color: '#065F46', fontWeight: 600 }} />;
  if (tipo === 'salida')
    return <Chip icon={<TrendingDownIcon sx={{ fontSize: '14px !important' }} />} label="Salida" size="small" sx={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 600 }} />;
  return <Chip icon={<TuneIcon sx={{ fontSize: '14px !important' }} />} label="Ajuste" size="small" sx={{ backgroundColor: '#EDE9FE', color: '#5B21B6', fontWeight: 600 }} />;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TabMovimientos() {
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stock/movimientos')
      .then((r) => r.json())
      .then((d) => setMovimientos(d.items ?? []))
      .catch(() => setError('Error al cargar movimientos'))
      .finally(() => setCargando(false));
  }, []);

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
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>Historial de movimientos</Typography>
        <Chip label={movimientos.length} size="small" sx={{ ml: 'auto', backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 700 }} />
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Tipo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Cantidad</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Anterior</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Nueva</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Motivo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimientos.map((m) => (
              <TableRow key={m.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>
                  <Typography variant="caption" sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>{formatFecha(m.creadoEn)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{m.itemNombre ?? m.itemId}</Typography>
                </TableCell>
                <TableCell><TipoChip tipo={m.tipo} /></TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 700, color: m.tipo === 'entrada' ? '#059669' : m.tipo === 'salida' ? '#DC2626' : '#7C3AED' }}>
                    {m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '-' : '='}{m.cantidad}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>{m.cantidadAnterior}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.cantidadNueva}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: m.motivo ? '#475569' : '#CBD5E1' }}>{m.motivo || '—'}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
