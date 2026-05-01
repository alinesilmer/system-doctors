'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SearchIcon from '@mui/icons-material/Search';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PageContainer from '@/components/ui/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConfirmarDialogo from '@/components/ui/ConfirmarDialogo';
import TabAlertas from '@/components/stock/TabAlertas';
import TabMovimientos from '@/components/stock/TabMovimientos';
import TabFacturaDemo from '@/components/stock/TabFacturaDemo';
import TabProcedimiento from '@/components/stock/TabProcedimiento';
import { useStock } from '@/hooks/useStock';
import type { ItemStock } from '@/lib/types';

function nivelStock(item: ItemStock) {
  if (item.cantidad <= 0) return { label: 'Sin stock', color: '#EF4444', bg: '#FEE2E2', pct: 0 };
  if (item.cantidad <= item.cantidadMinima) return { label: 'Stock bajo', color: '#D97706', bg: '#FEF3C7', pct: Math.min((item.cantidad / Math.max(item.cantidadMinima * 2, 1)) * 100, 100) };
  return { label: 'Normal', color: '#059669', bg: '#D1FAE5', pct: 100 };
}

const TABS = [
  { label: 'Inventario', icon: <InventoryOutlinedIcon sx={{ fontSize: 18 }} /> },
  { label: 'Alertas', icon: <NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }} /> },
  { label: 'Movimientos', icon: <HistoryOutlinedIcon sx={{ fontSize: 18 }} /> },
  { label: 'Factura Demo 🟡', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} /> },
  { label: 'Procedimiento 🟡', icon: <MedicalServicesOutlinedIcon sx={{ fontSize: 18 }} /> },
];

export default function StockPage() {
  const router = useRouter();
  const { items, cargando, error, recargar } = useStock();
  const [tab, setTab] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [dialogoEliminar, setDialogoEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [dialogoMovimiento, setDialogoMovimiento] = useState<ItemStock | null>(null);
  const [movimiento, setMovimiento] = useState({ tipo: 'entrada' as 'entrada' | 'salida' | 'ajuste', cantidad: 1, motivo: '' });
  const [guardandoMov, setGuardandoMov] = useState(false);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return items;
    const q = busqueda.toLowerCase();
    return items.filter(
      (i) =>
        i.nombre.toLowerCase().includes(q) ||
        i.categoria.toLowerCase().includes(q) ||
        i.codigoInterno?.toLowerCase().includes(q)
    );
  }, [items, busqueda]);

  const enAlerta = items.filter((i) => i.cantidad <= i.cantidadMinima);

  async function handleEliminar() {
    if (!dialogoEliminar) return;
    setEliminando(true);
    try {
      await fetch(`/api/stock/${dialogoEliminar.id}`, { method: 'DELETE' });
      setDialogoEliminar(null);
      recargar();
    } finally { setEliminando(false); }
  }

  async function handleMovimiento() {
    if (!dialogoMovimiento) return;
    setGuardandoMov(true);
    try {
      await fetch(`/api/stock/${dialogoMovimiento.id}/movimiento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...movimiento, itemId: dialogoMovimiento.id }),
      });
      setDialogoMovimiento(null);
      setMovimiento({ tipo: 'entrada', cantidad: 1, motivo: '' });
      recargar();
    } finally { setGuardandoMov(false); }
  }

  const acciones = (
    <Link href="/stock/nuevo" style={{ textDecoration: 'none' }}>
      <Button variant="contained" startIcon={<AddIcon />}>Nuevo item</Button>
    </Link>
  );

  return (
    <PageContainer titulo="Stock" subtitulo={`${items.length} items en inventario`} acciones={acciones}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #E2E8F0', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem', minHeight: 44 },
            '& .Mui-selected': { fontWeight: 700 },
          }}
        >
          {TABS.map((t, i) => (
            <Tab
              key={i}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {t.icon}
                  <span>{t.label}</span>
                  {i === 1 && enAlerta.length > 0 && (
                    <Chip label={enAlerta.length} size="small" sx={{ height: 18, fontSize: '0.65rem', backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 700, ml: 0.5 }} />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab 0: Inventario */}
      {tab === 0 && (
        <Card sx={{ overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Buscar por nombre, categoría, código…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} /> } }}
              sx={{ maxWidth: 400, flex: 1 }}
            />
          </Box>

          {cargando ? (
            <LoadingScreen mensaje="Cargando inventario..." />
          ) : filtrados.length === 0 ? (
            <EmptyState
              titulo={busqueda ? 'Sin resultados' : 'Sin items en stock'}
              descripcion={busqueda ? `Sin resultados para "${busqueda}"` : 'Agregá el primer item al inventario'}
              icono={<InventoryOutlinedIcon sx={{ fontSize: 'inherit' }} />}
              accion={!busqueda ? { label: 'Agregar item', onClick: () => router.push('/stock/nuevo') } : undefined}
            />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell>Ubicación</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrados.map((item) => {
                    const nivel = nivelStock(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {item.nombre}
                            </Typography>
                            {item.codigoInterno && (
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
                                #{item.codigoInterno}
                              </Typography>
                            )}
                            {item.lote && (
                              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                                Lote: {item.lote}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={item.categoria} size="small" sx={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ minWidth: 120 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{item.cantidad}</Typography>
                              <Typography variant="caption" sx={{ color: '#94A3B8' }}>{item.unidad}</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={nivel.pct}
                              sx={{ backgroundColor: '#F1F5F9', '& .MuiLinearProgress-bar': { backgroundColor: nivel.color } }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={nivel.label} size="small" sx={{ backgroundColor: nivel.bg, color: nivel.color, fontWeight: 600, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: item.proveedor ? '#475569' : '#CBD5E1' }}>
                            {item.proveedor || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: item.ubicacion ? '#475569' : '#CBD5E1' }}>
                            {item.ubicacion || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="Registrar movimiento">
                              <IconButton size="small" sx={{ color: '#10B981' }} onClick={() => setDialogoMovimiento(item)}>
                                <SwapVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton size="small" onClick={() => router.push(`/stock/${item.id}/editar`)}>
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton size="small" sx={{ color: '#EF4444' }} onClick={() => setDialogoEliminar({ id: item.id, nombre: item.nombre })}>
                                <DeleteOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {/* Tab 1: Alertas */}
      {tab === 1 && <TabAlertas items={items} />}

      {/* Tab 2: Movimientos */}
      {tab === 2 && <TabMovimientos />}

      {/* Tab 3: Factura Demo */}
      {tab === 3 && <TabFacturaDemo onIngreso={recargar} />}

      {/* Tab 4: Procedimiento */}
      {tab === 4 && <TabProcedimiento items={items} onEjecucion={recargar} />}

      {/* Dialogo movimiento */}
      <Dialog open={!!dialogoMovimiento} onClose={() => setDialogoMovimiento(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Registrar movimiento — {dialogoMovimiento?.nombre}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Tipo de movimiento"
            select
            value={movimiento.tipo}
            onChange={(e) => setMovimiento((p) => ({ ...p, tipo: e.target.value as 'entrada' | 'salida' | 'ajuste' }))}
            fullWidth
            size="small"
          >
            <MenuItem value="entrada">Entrada (agregar stock)</MenuItem>
            <MenuItem value="salida">Salida (retirar stock)</MenuItem>
            <MenuItem value="ajuste">Ajuste (definir cantidad exacta)</MenuItem>
          </TextField>
          <TextField
            label="Cantidad"
            type="number"
            value={movimiento.cantidad}
            onChange={(e) => setMovimiento((p) => ({ ...p, cantidad: parseInt(e.target.value) || 0 }))}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
          />
          <TextField
            label="Motivo"
            value={movimiento.motivo}
            onChange={(e) => setMovimiento((p) => ({ ...p, motivo: e.target.value }))}
            fullWidth
            size="small"
            placeholder="Ej: Compra, uso en consultorio, vencimiento…"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDialogoMovimiento(null)} disabled={guardandoMov}>Cancelar</Button>
          <Button variant="contained" onClick={handleMovimiento} disabled={guardandoMov || movimiento.cantidad <= 0}>
            {guardandoMov ? 'Guardando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmarDialogo
        abierto={!!dialogoEliminar}
        titulo="Eliminar item"
        descripcion={`¿Estás seguro de que deseas eliminar "${dialogoEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        cargando={eliminando}
        onConfirmar={handleEliminar}
        onCancelar={() => setDialogoEliminar(null)}
      />
    </PageContainer>
  );
}
