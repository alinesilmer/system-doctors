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
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PageContainer from '@/components/ui/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConfirmarDialogo from '@/components/ui/ConfirmarDialogo';
import { useTratamientos } from '@/hooks/useTratamientos';

function formatPrecio(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function TratamientosPage() {
  const router = useRouter();
  const { tratamientos, cargando, error, recargar } = useTratamientos();
  const [busqueda, setBusqueda] = useState('');
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [dialogoEliminar, setDialogoEliminar] = useState<{ id: string; nombre: string } | null>(null);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return tratamientos;
    const q = busqueda.toLowerCase();
    return tratamientos.filter(
      (t) => t.nombre.toLowerCase().includes(q) || t.descripcion?.toLowerCase().includes(q)
    );
  }, [tratamientos, busqueda]);

  async function handleEliminar() {
    if (!dialogoEliminar) return;
    setEliminando(dialogoEliminar.id);
    try {
      const res = await fetch(`/api/tratamientos/${dialogoEliminar.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDialogoEliminar(null);
      recargar();
    } finally {
      setEliminando(null);
    }
  }

  const acciones = (
    <Link href="/tratamientos/nuevo" style={{ textDecoration: 'none' }}>
      <Button variant="contained" startIcon={<AddIcon />}>
        Nuevo tratamiento
      </Button>
    </Link>
  );

  return (
    <PageContainer
      titulo="Tratamientos"
      subtitulo={`${tratamientos.length} tratamiento${tratamientos.length !== 1 ? 's' : ''} configurado${tratamientos.length !== 1 ? 's' : ''}`}
      acciones={acciones}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Buscar tratamiento…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} /> } }}
            sx={{ maxWidth: 380, flex: 1 }}
          />
          {busqueda && (
            <Typography variant="caption" sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {cargando ? (
          <LoadingScreen mensaje="Cargando tratamientos..." />
        ) : filtrados.length === 0 ? (
          <EmptyState
            titulo={busqueda ? 'Sin resultados' : 'Sin tratamientos aún'}
            descripcion={
              busqueda
                ? `No se encontraron tratamientos para "${busqueda}"`
                : 'Cargá tratamientos para usarlos rápidamente en presupuestos'
            }
            icono={<MedicalServicesOutlinedIcon sx={{ fontSize: 'inherit' }} />}
            accion={
              !busqueda
                ? { label: 'Agregar tratamiento', onClick: () => router.push('/tratamientos/nuevo') }
                : undefined
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tratamiento</TableCell>
                  <TableCell align="center">Prácticas</TableCell>
                  <TableCell align="right">Precio total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrados.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{t.nombre}</Typography>
                      {t.descripcion && (
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          {t.descripcion.slice(0, 70)}{t.descripcion.length > 70 ? '…' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${t.practicas.length} práctica${t.practicas.length !== 1 ? 's' : ''}`}
                        size="small"
                        sx={{ backgroundColor: '#EDE9FE', color: '#5B21B6', fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {formatPrecio(t.precioTotal)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={{
                          backgroundColor: t.activo ? '#D1FAE5' : '#F1F5F9',
                          color: t.activo ? '#065F46' : '#94A3B8',
                          fontWeight: 600, fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => router.push(`/tratamientos/${t.id}/editar`)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            sx={{ color: '#EF4444' }}
                            onClick={() => setDialogoEliminar({ id: t.id, nombre: t.nombre })}
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
        )}
      </Card>

      <ConfirmarDialogo
        abierto={!!dialogoEliminar}
        titulo="Eliminar tratamiento"
        descripcion={`¿Estás seguro de que deseas eliminar "${dialogoEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        cargando={!!eliminando}
        onConfirmar={handleEliminar}
        onCancelar={() => setDialogoEliminar(null)}
      />
    </PageContainer>
  );
}
