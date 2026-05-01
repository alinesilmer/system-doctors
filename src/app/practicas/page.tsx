'use client';

import { useState, useMemo } from 'react';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PageContainer from '@/components/ui/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConfirmarDialogo from '@/components/ui/ConfirmarDialogo';
import { usePracticas } from '@/hooks/usePracticas';
import type { Practica } from '@/lib/types';

function formatPrecio(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

const PRACTICA_VACIA: Omit<Practica, 'id' | 'creadoEn' | 'actualizadoEn'> = {
  nombre: '', descripcion: '', precio: 0, duracionMinutos: undefined, categoria: '', activa: true,
};

export default function PracticasPage() {
  const { practicas, cargando, error, recargar } = usePracticas();
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [dialogoEliminar, setDialogoEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [dialogoForm, setDialogoForm] = useState<{ abierto: boolean; practica: Practica | null }>({ abierto: false, practica: null });
  const [form, setForm] = useState(PRACTICA_VACIA);

  const filtradas = useMemo(() => {
    if (!busqueda.trim()) return practicas;
    const q = busqueda.toLowerCase();
    return practicas.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.categoria?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q)
    );
  }, [practicas, busqueda]);

  function abrirCrear() {
    setForm(PRACTICA_VACIA);
    setErrorForm(null);
    setDialogoForm({ abierto: true, practica: null });
  }

  function abrirEditar(p: Practica) {
    setForm({ nombre: p.nombre, descripcion: p.descripcion ?? '', precio: p.precio, duracionMinutos: p.duracionMinutos, categoria: p.categoria ?? '', activa: p.activa });
    setErrorForm(null);
    setDialogoForm({ abierto: true, practica: p });
  }

  async function handleGuardar() {
    setErrorForm(null);
    if (!form.nombre.trim()) { setErrorForm('El nombre es obligatorio'); return; }
    setGuardando(true);
    try {
      const payload = { ...form, nombre: form.nombre.trim(), descripcion: form.descripcion?.trim() || undefined, categoria: form.categoria?.trim() || undefined };
      const res = dialogoForm.practica
        ? await fetch(`/api/practicas/${dialogoForm.practica.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/practicas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Error al guardar'); }
      setDialogoForm({ abierto: false, practica: null });
      recargar();
    } catch (e) {
      setErrorForm((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar() {
    if (!dialogoEliminar) return;
    setEliminando(dialogoEliminar.id);
    try {
      await fetch(`/api/practicas/${dialogoEliminar.id}`, { method: 'DELETE' });
      setDialogoEliminar(null);
      recargar();
    } finally {
      setEliminando(null);
    }
  }

  const acciones = (
    <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCrear}>
      Nueva práctica
    </Button>
  );

  return (
    <PageContainer
      titulo="Prácticas"
      subtitulo={`${practicas.length} práctica${practicas.length !== 1 ? 's' : ''} configurada${practicas.length !== 1 ? 's' : ''}`}
      acciones={acciones}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Buscar práctica…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} /> } }}
            sx={{ maxWidth: 380, flex: 1 }}
          />
          {busqueda && (
            <Typography variant="caption" sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>
              {filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {cargando ? (
          <LoadingScreen mensaje="Cargando prácticas..." />
        ) : filtradas.length === 0 ? (
          <EmptyState
            titulo={busqueda ? 'Sin resultados' : 'Sin prácticas aún'}
            descripcion={busqueda ? `No se encontraron prácticas para "${busqueda}"` : 'Cargá las prácticas que ofrecés para usarlas en tratamientos y presupuestos'}
            icono={<LocalHospitalOutlinedIcon sx={{ fontSize: 'inherit' }} />}
            accion={!busqueda ? { label: 'Agregar práctica', onClick: abrirCrear } : undefined}
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtradas.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{p.nombre}</Typography>
                      {p.descripcion && (
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          {p.descripcion.slice(0, 60)}{p.descripcion.length > 60 ? '…' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.categoria ? (
                        <Chip label={p.categoria} size="small" sx={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.7rem' }} />
                      ) : (
                        <Typography variant="caption" sx={{ color: '#CBD5E1' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.duracionMinutos ? (
                        <Typography variant="body2">{p.duracionMinutos} min</Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#CBD5E1' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatPrecio(p.precio)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.activa ? 'Activa' : 'Inactiva'}
                        size="small"
                        sx={{ backgroundColor: p.activa ? '#D1FAE5' : '#F1F5F9', color: p.activa ? '#065F46' : '#94A3B8', fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => abrirEditar(p)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" sx={{ color: '#EF4444' }} onClick={() => setDialogoEliminar({ id: p.id, nombre: p.nombre })}>
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
        )}
      </Card>

      {/* Diálogo crear/editar */}
      <Dialog open={dialogoForm.abierto} onClose={() => setDialogoForm({ abierto: false, practica: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogoForm.practica ? 'Editar práctica' : 'Nueva práctica'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {errorForm && <Alert severity="error">{errorForm}</Alert>}
            <TextField
              label="Nombre *"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              fullWidth
              autoFocus
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Precio *"
                type="number"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
              />
              <TextField
                label="Duración (minutos)"
                type="number"
                value={form.duracionMinutos ?? ''}
                onChange={(e) => setForm({ ...form, duracionMinutos: e.target.value ? parseInt(e.target.value) : undefined })}
                slotProps={{ input: { endAdornment: <InputAdornment position="end">min</InputAdornment> } }}
              />
            </Box>
            <TextField
              label="Categoría"
              value={form.categoria ?? ''}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              fullWidth
              placeholder="Ej: Odontología, Traumatología, Diagnóstico…"
            />
            <TextField
              label="Descripción"
              value={form.descripcion ?? ''}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <FormControlLabel
              control={<Switch checked={form.activa} onChange={(e) => setForm({ ...form, activa: e.target.checked })} />}
              label="Práctica activa"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogoForm({ abierto: false, practica: null })} disabled={guardando}>
            Cancelar
          </Button>
          <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={handleGuardar} loading={guardando}>
            {dialogoForm.practica ? 'Guardar cambios' : 'Crear práctica'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmarDialogo
        abierto={!!dialogoEliminar}
        titulo="Eliminar práctica"
        descripcion={`¿Estás seguro de que deseas eliminar "${dialogoEliminar?.nombre}"?`}
        textoConfirmar="Eliminar"
        cargando={!!eliminando}
        onConfirmar={handleEliminar}
        onCancelar={() => setDialogoEliminar(null)}
      />
    </PageContainer>
  );
}
