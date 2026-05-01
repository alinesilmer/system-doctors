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
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PageContainer from '@/components/ui/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConfirmarDialogo from '@/components/ui/ConfirmarDialogo';
import { usePacientes } from '@/hooks/usePacientes';

function iniciales(nombre: string, apellido: string) {
  return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
}

function avatarColor(str: string) {
  const colors = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];
  let hash = 0;
  for (const ch of str) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function PacientesPage() {
  const router = useRouter();
  const { pacientes, cargando, error, recargar } = usePacientes();
  const [busqueda, setBusqueda] = useState('');
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [dialogoEliminar, setDialogoEliminar] = useState<{ id: string; nombre: string } | null>(null);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return pacientes;
    const q = busqueda.toLowerCase();
    return pacientes.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.apellido.toLowerCase().includes(q) ||
        p.dni.includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.telefono.includes(q)
    );
  }, [pacientes, busqueda]);

  async function handleEliminar() {
    if (!dialogoEliminar) return;
    setEliminando(dialogoEliminar.id);
    try {
      const res = await fetch(`/api/pacientes/${dialogoEliminar.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDialogoEliminar(null);
      recargar();
    } finally {
      setEliminando(null);
    }
  }

  const acciones = (
    <Link href="/pacientes/nuevo" style={{ textDecoration: 'none' }}>
      <Button variant="contained" startIcon={<AddIcon />}>
        Nuevo paciente
      </Button>
    </Link>
  );

  return (
    <PageContainer
      titulo="Pacientes"
      subtitulo={`${pacientes.length} pacientes registrados`}
      acciones={acciones}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ overflow: 'hidden' }}>
        {/* Barra de búsqueda */}
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Buscar por nombre, apellido, DNI…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} /> } }}
            sx={{ maxWidth: 400, flex: 1 }}
          />
          {busqueda && (
            <Typography variant="caption" sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {cargando ? (
          <LoadingScreen mensaje="Cargando pacientes..." />
        ) : filtrados.length === 0 ? (
          <EmptyState
            titulo={busqueda ? 'Sin resultados' : 'Sin pacientes aún'}
            descripcion={
              busqueda
                ? `No se encontraron pacientes para "${busqueda}"`
                : 'Registrá tu primer paciente para comenzar'
            }
            icono={<PeopleAltOutlinedIcon sx={{ fontSize: 'inherit' }} />}
            accion={
              !busqueda
                ? { label: 'Agregar paciente', onClick: () => router.push('/pacientes/nuevo') }
                : undefined
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Paciente</TableCell>
                  <TableCell>DNI</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Obra Social</TableCell>
                  <TableCell>Grupo Sanguíneo</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrados.map((p) => (
                  <TableRow key={p.id} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            backgroundColor: avatarColor(`${p.nombre}${p.apellido}`),
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          {iniciales(p.nombre, p.apellido)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
                            {p.apellido}, {p.nombre}
                          </Typography>
                          {p.email && (
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                              {p.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {p.dni}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{p.telefono}</Typography>
                    </TableCell>
                    <TableCell>
                      {p.obraSocial ? (
                        <Chip
                          label={p.obraSocial}
                          size="small"
                          sx={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.7rem' }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ color: '#CBD5E1' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.grupoSanguineo ? (
                        <Chip
                          label={p.grupoSanguineo}
                          size="small"
                          sx={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ color: '#CBD5E1' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="Ver perfil">
                          <IconButton size="small" onClick={() => router.push(`/pacientes/${p.id}`)}>
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => router.push(`/pacientes/${p.id}/editar`)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            sx={{ color: '#EF4444' }}
                            onClick={() => setDialogoEliminar({ id: p.id, nombre: `${p.nombre} ${p.apellido}` })}
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
        titulo="Eliminar paciente"
        descripcion={`¿Estás seguro de que deseas eliminar a ${dialogoEliminar?.nombre}? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        cargando={!!eliminando}
        onConfirmar={handleEliminar}
        onCancelar={() => setDialogoEliminar(null)}
      />
    </PageContainer>
  );
}
