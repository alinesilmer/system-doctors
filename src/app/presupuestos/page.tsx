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
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PageContainer from '@/components/ui/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConfirmarDialogo from '@/components/ui/ConfirmarDialogo';
import { usePresupuestos } from '@/hooks/usePresupuestos';
import type { EstadoPresupuesto } from '@/lib/types';

const ESTADOS: Record<EstadoPresupuesto, { label: string; color: string; bg: string }> = {
  borrador:  { label: 'Borrador',  color: '#92400E', bg: '#FEF3C7' },
  enviado:   { label: 'Enviado',   color: '#1D4ED8', bg: '#DBEAFE' },
  aceptado:  { label: 'Aceptado',  color: '#065F46', bg: '#D1FAE5' },
  rechazado: { label: 'Rechazado', color: '#991B1B', bg: '#FEE2E2' },
  vencido:   { label: 'Vencido',   color: '#475569', bg: '#F1F5F9' },
};

function formatPrecio(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function PresupuestosPage() {
  const router = useRouter();
  const { presupuestos, cargando, error, recargar } = usePresupuestos();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [dialogoEliminar, setDialogoEliminar] = useState<{ id: string; nombre: string } | null>(null);

  const filtrados = useMemo(() => {
    return presupuestos.filter((p) => {
      const coincideBusqueda =
        !busqueda.trim() ||
        p.pacienteNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.numero?.includes(busqueda) ||
        p.notas?.toLowerCase().includes(busqueda.toLowerCase());
      const coincideEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
      return coincideBusqueda && coincideEstado;
    });
  }, [presupuestos, busqueda, filtroEstado]);

  async function handleEliminar() {
    if (!dialogoEliminar) return;
    setEliminando(dialogoEliminar.id);
    try {
      const res = await fetch(`/api/presupuestos/${dialogoEliminar.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDialogoEliminar(null);
      recargar();
    } finally {
      setEliminando(null);
    }
  }

  const acciones = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Link href="/tratamientos" style={{ textDecoration: 'none' }}>
        <Button variant="outlined" startIcon={<MedicalServicesOutlinedIcon />}>
          Tratamientos
        </Button>
      </Link>
      <Link href="/presupuestos/nuevo" style={{ textDecoration: 'none' }}>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nuevo presupuesto
        </Button>
      </Link>
    </Box>
  );

  return (
    <PageContainer
      titulo="Presupuestos"
      subtitulo={`${presupuestos.length} presupuesto${presupuestos.length !== 1 ? 's' : ''}`}
      acciones={acciones}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por paciente, número o notas…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} /> } }}
            sx={{ maxWidth: 380, flex: 1, minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Estado</InputLabel>
            <Select label="Estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <MenuItem value="todos">Todos</MenuItem>
              {(Object.keys(ESTADOS) as EstadoPresupuesto[]).map((e) => (
                <MenuItem key={e} value={e}>{ESTADOS[e].label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {(busqueda || filtroEstado !== 'todos') && (
            <Typography variant="caption" sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {cargando ? (
          <LoadingScreen mensaje="Cargando presupuestos..." />
        ) : filtrados.length === 0 ? (
          <EmptyState
            titulo={busqueda || filtroEstado !== 'todos' ? 'Sin resultados' : 'Sin presupuestos aún'}
            descripcion={
              busqueda || filtroEstado !== 'todos'
                ? 'No se encontraron presupuestos con ese criterio'
                : 'Creá presupuestos con tratamientos, prácticas y estudios externos'
            }
            icono={<ReceiptLongOutlinedIcon sx={{ fontSize: 'inherit' }} />}
            accion={
              !busqueda && filtroEstado === 'todos'
                ? { label: 'Crear presupuesto', onClick: () => router.push('/presupuestos/nuevo') }
                : undefined
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Paciente</TableCell>
                  <TableCell align="center">Ítems</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Válido hasta</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrados.map((p) => {
                  const estadoStyle = ESTADOS[p.estado];
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                          {p.pacienteNombre ?? 'Sin paciente asignado'}
                        </Typography>
                        {p.numero && (
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
                            #{p.numero}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${p.items.length} ítem${p.items.length !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {formatPrecio(p.total)}
                        </Typography>
                        {p.descuento > 0 && (
                          <Typography variant="caption" sx={{ color: '#10B981' }}>
                            -{formatPrecio(p.descuento)} dto.
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={estadoStyle.label}
                          size="small"
                          sx={{ backgroundColor: estadoStyle.bg, color: estadoStyle.color, fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        {p.validoHasta ? (
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {new Date(p.validoHasta).toLocaleDateString('es-AR')}
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#CBD5E1' }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {new Date(p.creadoEn).toLocaleDateString('es-AR')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Ver presupuesto">
                            <IconButton size="small" onClick={() => router.push(`/presupuestos/${p.id}`)}>
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => router.push(`/presupuestos/${p.id}/editar`)}>
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              sx={{ color: '#EF4444' }}
                              onClick={() => setDialogoEliminar({ id: p.id, nombre: p.pacienteNombre ?? `Presupuesto ${p.id.slice(0, 8)}` })}
                            >
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

      <ConfirmarDialogo
        abierto={!!dialogoEliminar}
        titulo="Eliminar presupuesto"
        descripcion={`¿Estás seguro de que deseas eliminar el presupuesto de "${dialogoEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        cargando={!!eliminando}
        onConfirmar={handleEliminar}
        onCancelar={() => setDialogoEliminar(null)}
      />
    </PageContainer>
  );
}
