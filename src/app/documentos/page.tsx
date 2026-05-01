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
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PageContainer from '@/components/ui/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConfirmarDialogo from '@/components/ui/ConfirmarDialogo';
import { useDocumentos } from '@/hooks/useDocumentos';
import type { TipoDocumento } from '@/lib/types';

const TIPO_LABELS: Record<TipoDocumento, string> = {
  consentimiento: 'Consentimiento',
  informacion: 'Información',
  protocolo: 'Protocolo',
  formulario: 'Formulario',
  otro: 'Otro',
};

const TIPO_COLORS: Record<TipoDocumento, { bg: string; color: string }> = {
  consentimiento: { bg: '#DBEAFE', color: '#1D4ED8' },
  informacion:    { bg: '#D1FAE5', color: '#065F46' },
  protocolo:      { bg: '#EDE9FE', color: '#5B21B6' },
  formulario:     { bg: '#FEF3C7', color: '#92400E' },
  otro:           { bg: '#F1F5F9', color: '#475569' },
};

export default function DocumentosPage() {
  const router = useRouter();
  const { documentos, cargando, error, recargar } = useDocumentos();
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [dialogoEliminar, setDialogoEliminar] = useState<{ id: string; titulo: string } | null>(null);

  const filtrados = useMemo(() => {
    return documentos.filter((d) => {
      const coincideBusqueda =
        !busqueda.trim() ||
        d.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.etiquetas?.some((e) => e.toLowerCase().includes(busqueda.toLowerCase()));
      const coincideTipo = filtroTipo === 'todos' || d.tipo === filtroTipo;
      return coincideBusqueda && coincideTipo;
    });
  }, [documentos, busqueda, filtroTipo]);

  async function handleEliminar() {
    if (!dialogoEliminar) return;
    setEliminando(dialogoEliminar.id);
    try {
      const res = await fetch(`/api/documentos/${dialogoEliminar.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDialogoEliminar(null);
      recargar();
    } finally {
      setEliminando(null);
    }
  }

  const acciones = (
    <Link href="/documentos/nuevo" style={{ textDecoration: 'none' }}>
      <Button variant="contained" startIcon={<AddIcon />}>
        Nuevo documento
      </Button>
    </Link>
  );

  return (
    <PageContainer
      titulo="Documentos"
      subtitulo={`${documentos.length} documento${documentos.length !== 1 ? 's' : ''} cargado${documentos.length !== 1 ? 's' : ''}`}
      acciones={acciones}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por título, descripción o etiqueta…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} /> } }}
            sx={{ maxWidth: 380, flex: 1, minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              label="Tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <MenuItem value="todos">Todos los tipos</MenuItem>
              {(Object.keys(TIPO_LABELS) as TipoDocumento[]).map((t) => (
                <MenuItem key={t} value={t}>{TIPO_LABELS[t]}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {(busqueda || filtroTipo !== 'todos') && (
            <Typography variant="caption" sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {cargando ? (
          <LoadingScreen mensaje="Cargando documentos..." />
        ) : filtrados.length === 0 ? (
          <EmptyState
            titulo={busqueda || filtroTipo !== 'todos' ? 'Sin resultados' : 'Sin documentos aún'}
            descripcion={
              busqueda || filtroTipo !== 'todos'
                ? 'No se encontraron documentos con ese criterio'
                : 'Cargá consentimientos, protocolos e información para usar en la práctica'
            }
            icono={<ArticleOutlinedIcon sx={{ fontSize: 'inherit' }} />}
            accion={
              !busqueda && filtroTipo === 'todos'
                ? { label: 'Agregar documento', onClick: () => router.push('/documentos/nuevo') }
                : undefined
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Etiquetas</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrados.map((doc) => {
                  const tipoStyle = TIPO_COLORS[doc.tipo];
                  return (
                    <TableRow key={doc.id} sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36, height: 36, borderRadius: '8px',
                              backgroundColor: tipoStyle.bg,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <ArticleOutlinedIcon sx={{ fontSize: 18, color: tipoStyle.color }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {doc.titulo}
                            </Typography>
                            {doc.descripcion && (
                              <Typography variant="caption" sx={{ color: '#94A3B8' }} noWrap>
                                {doc.descripcion.slice(0, 60)}{doc.descripcion.length > 60 ? '…' : ''}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={TIPO_LABELS[doc.tipo]}
                          size="small"
                          sx={{ backgroundColor: tipoStyle.bg, color: tipoStyle.color, fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {doc.etiquetas?.slice(0, 3).map((e) => (
                            <Chip key={e} label={e} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                          ))}
                          {(doc.etiquetas?.length ?? 0) > 3 && (
                            <Chip label={`+${doc.etiquetas!.length - 3}`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={doc.activo ? 'Activo' : 'Inactivo'}
                          size="small"
                          sx={{
                            backgroundColor: doc.activo ? '#D1FAE5' : '#F1F5F9',
                            color: doc.activo ? '#065F46' : '#94A3B8',
                            fontWeight: 600, fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {new Date(doc.creadoEn).toLocaleDateString('es-AR')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Ver documento">
                            <IconButton size="small" onClick={() => router.push(`/documentos/${doc.id}`)}>
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => router.push(`/documentos/${doc.id}/editar`)}>
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              sx={{ color: '#EF4444' }}
                              onClick={() => setDialogoEliminar({ id: doc.id, titulo: doc.titulo })}
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
        titulo="Eliminar documento"
        descripcion={`¿Estás seguro de que deseas eliminar "${dialogoEliminar?.titulo}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        cargando={!!eliminando}
        onConfirmar={handleEliminar}
        onCancelar={() => setDialogoEliminar(null)}
      />
    </PageContainer>
  );
}
