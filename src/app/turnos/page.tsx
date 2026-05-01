'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import TodayIcon from '@mui/icons-material/Today';
import CalendarioTurnos from '@/components/turnos/CalendarioTurnos';
import PageContainer from '@/components/ui/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConfirmarDialogo from '@/components/ui/ConfirmarDialogo';
import EstadoChip from '@/components/ui/EstadoChip';
import { useTurnos } from '@/hooks/useTurnos';
import type { EstadoTurno, Turno } from '@/lib/types';

const ESTADOS_FILTRO: { value: string; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'confirmado', label: 'Confirmados' },
  { value: 'cancelado', label: 'Cancelados' },
  { value: 'completado', label: 'Completados' },
];

function formatFecha(fecha: string) {
  if (!fecha) return '—';
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

function agruparPorFecha(turnos: Turno[]) {
  const mapa = new Map<string, Turno[]>();
  for (const t of turnos) {
    const arr = mapa.get(t.fecha) ?? [];
    arr.push(t);
    mapa.set(t.fecha, arr);
  }
  return Array.from(mapa.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function TurnosPage() {
  const router = useRouter();
  const { turnos, cargando, error, recargar } = useTurnos();
  const [vista, setVista] = useState<'lista' | 'calendario'>('lista');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [dialogoEliminar, setDialogoEliminar] = useState<{ id: string } | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const filtrados = useMemo(() => {
    return turnos.filter((t) => {
      const matchEstado = estadoFiltro === 'todos' || t.estado === estadoFiltro;
      const q = busqueda.toLowerCase();
      const matchBusqueda = !q || t.pacienteNombre?.toLowerCase().includes(q) || t.motivo.toLowerCase().includes(q);
      return matchEstado && matchBusqueda;
    });
  }, [turnos, estadoFiltro, busqueda]);

  async function handleEliminar() {
    if (!dialogoEliminar) return;
    setEliminando(true);
    try {
      await fetch(`/api/turnos/${dialogoEliminar.id}`, { method: 'DELETE' });
      setDialogoEliminar(null);
      recargar();
    } finally {
      setEliminando(false);
    }
  }

  const acciones = (
    <Link href="/turnos/nuevo" style={{ textDecoration: 'none' }}>
      <Button variant="contained" startIcon={<AddIcon />}>
        Nuevo turno
      </Button>
    </Link>
  );

  const grupos = agruparPorFecha(filtrados);
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <PageContainer titulo="Turnos" subtitulo={`${turnos.length} turnos en total`} acciones={acciones}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ overflow: 'hidden' }}>
        {/* Filtros */}
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Buscar paciente o motivo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200, maxWidth: 320 }}
          />
          <TextField
            select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            size="small"
            sx={{ minWidth: 140 }}
          >
            {ESTADOS_FILTRO.map((op) => (
              <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
            ))}
          </TextField>
          <ToggleButtonGroup
            value={vista}
            exclusive
            onChange={(_, v) => v && setVista(v)}
            size="small"
            sx={{ ml: 'auto' }}
          >
            <ToggleButton value="lista" sx={{ px: 1.5 }}>
              <Tooltip title="Vista lista"><ViewListOutlinedIcon fontSize="small" /></Tooltip>
            </ToggleButton>
            <ToggleButton value="calendario" sx={{ px: 1.5 }}>
              <Tooltip title="Vista calendario"><CalendarMonthOutlinedIcon fontSize="small" /></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {cargando ? (
          <LoadingScreen mensaje="Cargando turnos..." />
        ) : filtrados.length === 0 ? (
          <EmptyState
            titulo="Sin turnos"
            descripcion="No hay turnos que coincidan con los filtros seleccionados"
            icono={<CalendarMonthOutlinedIcon sx={{ fontSize: 'inherit' }} />}
            accion={{ label: 'Nuevo turno', onClick: () => router.push('/turnos/nuevo') }}
          />
        ) : vista === 'lista' ? (
          // Vista agrupada por fecha
          <Box>
            {grupos.map(([fecha, items]) => (
              <Box key={fecha}>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: fecha === hoy ? '#EFF6FF' : '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {fecha === hoy && <TodayIcon sx={{ fontSize: 16, color: '#2563EB' }} />}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: fecha === hoy ? '#1D4ED8' : '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {fecha === hoy ? 'HOY — ' : ''}{formatFecha(fecha)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', ml: 0.5 }}>
                    ({items.length} turno{items.length !== 1 ? 's' : ''})
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {items.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell sx={{ width: 100 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {t.horaInicio}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                              — {t.horaFin}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {t.pacienteNombre ?? t.pacienteId}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {t.motivo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <EstadoChip estado={t.estado} />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => router.push(`/turnos/${t.id}/editar`)}>
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#EF4444' }}
                                  onClick={() => setDialogoEliminar({ id: t.id })}
                                >
                                  <DeleteOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Box>
        ) : (
          <CalendarioTurnos
            turnos={filtrados}
            onEditar={(id) => router.push(`/turnos/${id}/editar`)}
            onEliminar={(id) => setDialogoEliminar({ id })}
          />
        )}
      </Card>

      <ConfirmarDialogo
        abierto={!!dialogoEliminar}
        titulo="Eliminar turno"
        descripcion="¿Estás seguro de que deseas eliminar este turno? Esta acción no se puede deshacer."
        textoConfirmar="Eliminar"
        cargando={eliminando}
        onConfirmar={handleEliminar}
        onCancelar={() => setDialogoEliminar(null)}
      />
    </PageContainer>
  );
}
