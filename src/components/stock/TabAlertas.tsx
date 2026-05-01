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
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import type { ItemStock } from '@/lib/types';

function diasParaVencer(fecha: string): number {
  return Math.ceil((new Date(fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
}

function VencimientoChip({ dias }: { dias: number }) {
  if (dias < 0)
    return <Chip label="Vencido" size="small" sx={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 700 }} />;
  if (dias <= 30)
    return <Chip label={`Vence en ${dias}d`} size="small" sx={{ backgroundColor: '#FEE2E2', color: '#B91C1C', fontWeight: 700 }} />;
  if (dias <= 60)
    return <Chip label={`Vence en ${dias}d`} size="small" sx={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 700 }} />;
  return <Chip label={`Vence en ${dias}d`} size="small" sx={{ backgroundColor: '#D1FAE5', color: '#065F46', fontWeight: 600 }} />;
}

interface Props { items: ItemStock[] }

export default function TabAlertas({ items }: Props) {
  const conVencimiento = items.filter((i) => i.fechaVencimiento);
  const proxAVencer = conVencimiento
    .map((i) => ({ ...i, dias: diasParaVencer(i.fechaVencimiento!) }))
    .filter((i) => i.dias <= 90)
    .sort((a, b) => a.dias - b.dias);

  const stockBajo = items.filter((i) => i.cantidad <= i.cantidadMinima);
  const sinStock = items.filter((i) => i.cantidad <= 0);

  const totalAlertas = proxAVencer.length + stockBajo.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Summary */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 160, p: 2, borderRadius: 2, border: '1px solid #FEE2E2', backgroundColor: '#FFF5F5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <ErrorOutlineIcon sx={{ color: '#EF4444', fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sin stock</Typography>
          </Box>
          <Typography variant="h4" sx={{ color: '#B91C1C', fontWeight: 800 }}>{sinStock.length}</Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>items agotados</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 160, p: 2, borderRadius: 2, border: '1px solid #FEF3C7', backgroundColor: '#FFFDF0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <WarningAmberOutlinedIcon sx={{ color: '#D97706', fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock bajo</Typography>
          </Box>
          <Typography variant="h4" sx={{ color: '#92400E', fontWeight: 800 }}>{stockBajo.length}</Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>items bajo mínimo</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 160, p: 2, borderRadius: 2, border: '1px solid #FEE2E2', backgroundColor: '#FFF5F5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <WarningAmberOutlinedIcon sx={{ color: '#EF4444', fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Por vencer</Typography>
          </Box>
          <Typography variant="h4" sx={{ color: '#B91C1C', fontWeight: 800 }}>{proxAVencer.length}</Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>en los próximos 90 días</Typography>
        </Box>
      </Box>

      {totalAlertas === 0 && (
        <Alert icon={<CheckCircleOutlineIcon />} severity="success">
          Todo en orden — sin alertas de stock o vencimiento.
        </Alert>
      )}

      {/* Stock bajo */}
      {stockBajo.length > 0 && (
        <Card sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberOutlinedIcon sx={{ color: '#D97706', fontSize: 18 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>Stock bajo o agotado</Typography>
            <Chip label={stockBajo.length} size="small" sx={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 700, ml: 'auto' }} />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Categoría</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Actual</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Mínimo</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockBajo.map((item) => (
                  <TableRow key={item.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{item.nombre}</Typography>
                      {item.ubicacion && <Typography variant="caption" sx={{ color: '#94A3B8' }}>{item.ubicacion}</Typography>}
                    </TableCell>
                    <TableCell><Chip label={item.categoria} size="small" sx={{ backgroundColor: '#F1F5F9', color: '#475569' }} /></TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: item.cantidad <= 0 ? '#EF4444' : '#D97706' }}>
                        {item.cantidad} {item.unidad}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>{item.cantidadMinima} {item.unidad}</Typography>
                    </TableCell>
                    <TableCell>
                      {item.cantidad <= 0
                        ? <Chip label="Agotado" size="small" sx={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 700 }} />
                        : <Chip label="Stock bajo" size="small" sx={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 700 }} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Vencimientos */}
      {proxAVencer.length > 0 && (
        <Card sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorOutlineIcon sx={{ color: '#EF4444', fontSize: 18 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>Vencimientos próximos</Typography>
            <Chip label={`${proxAVencer.length} items`} size="small" sx={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 700, ml: 'auto' }} />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Lote</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Fecha vencimiento</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Cantidad</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proxAVencer.map((item) => (
                  <TableRow key={item.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{item.nombre}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#64748B' }}>{item.lote || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(item.fechaVencimiento! + 'T00:00:00').toLocaleDateString('es-AR')}</Typography>
                    </TableCell>
                    <TableCell><VencimientoChip dias={item.dias} /></TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.cantidad} {item.unidad}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
