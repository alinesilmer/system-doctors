'use client';

import { use, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PageContainer from '@/components/ui/PageContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConfirmarDialogo from '@/components/ui/ConfirmarDialogo';
import EmptyState from '@/components/ui/EmptyState';
import HistoriaClinica from '@/components/pacientes/HistoriaClinica';
import { usePaciente } from '@/hooks/usePacientes';
import { useUploadDocument } from '@/hooks/useUploadDocument';
import { actualizarPaciente } from '@/lib/firestore/pacientes';
import type { DocumentoPaciente } from '@/lib/types';

function Campo({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: value ? '#0F172A' : '#CBD5E1', mt: 0.25 }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

const HABITOS_LABELS: Record<string, string> = {
  tabaquismo: 'Tabaquismo',
  alcohol: 'Consumo de alcohol',
  sedentarismo: 'Sedentarismo',
  dieta_inadecuada: 'Dieta inadecuada',
  exceso_pantallas: 'Exceso de pantallas / Alteración del sueño',
  drogas: 'Consumo de otras sustancias',
};

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PerfilPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { paciente, cargando, error } = usePaciente(id);
  const [tab, setTab] = useState(0);
  const [dialogoEliminar, setDialogoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [documentos, setDocumentos] = useState<DocumentoPaciente[]>([]);
  const [docError, setDocError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, progreso, error: uploadError } = useUploadDocument(id);

  // Sync local docs state with paciente once loaded
  const docsActuales = documentos.length > 0 ? documentos : (paciente?.documentos ?? []);

  async function handleEliminar() {
    setEliminando(true);
    try {
      await fetch(`/api/pacientes/${id}`, { method: 'DELETE' });
      router.push('/pacientes');
    } finally {
      setEliminando(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !paciente) return;
    e.target.value = '';
    setDocError(null);
    try {
      const doc = await upload(file);
      if (!doc) return;
      const nuevos = [...docsActuales, doc];
      setDocumentos(nuevos);
      await actualizarPaciente(id, { documentos: nuevos });
    } catch {
      setDocError('Error al subir el archivo. Intentá de nuevo.');
    }
  }

  if (cargando) return <PageContainer titulo="Perfil del Paciente"><LoadingScreen /></PageContainer>;
  if (error || !paciente) return (
    <PageContainer titulo="Perfil del Paciente">
      <Alert severity="error">{error ?? 'Paciente no encontrado'}</Alert>
    </PageContainer>
  );

  const nombreCompleto = `${paciente.apellido}, ${paciente.nombre}`;
  const iniciales = `${paciente.nombre[0] ?? ''}${paciente.apellido[0] ?? ''}`.toUpperCase();

  const acciones = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.push('/pacientes')} size="small">
        Volver
      </Button>
      <Link href={`/pacientes/${id}/editar`} style={{ textDecoration: 'none' }}>
        <Button variant="outlined" startIcon={<EditOutlinedIcon />} size="small">
          Editar
        </Button>
      </Link>
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteOutlinedIcon />}
        onClick={() => setDialogoEliminar(true)}
        size="small"
      >
        Eliminar
      </Button>
    </Box>
  );

  return (
    <PageContainer titulo={nombreCompleto} subtitulo={`DNI: ${paciente.dni}`} acciones={acciones}>
      {/* Encabezado de perfil */}
      <Card sx={{ p: 3, mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              backgroundColor: '#2563EB',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {iniciales}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2" sx={{ color: '#0F172A', mb: 0.5 }}>
              {nombreCompleto}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              {paciente.grupoSanguineo && (
                <Chip
                  label={paciente.grupoSanguineo}
                  size="small"
                  sx={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 700 }}
                />
              )}
              {paciente.obraSocial && (
                <Chip
                  label={paciente.obraSocial}
                  size="small"
                  sx={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
                />
              )}
              {paciente.alergias && (
                <Chip
                  label={`Alergias: ${paciente.alergias}`}
                  size="small"
                  sx={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                />
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<CalendarMonthOutlinedIcon />}
            onClick={() => router.push(`/turnos/nuevo?pacienteId=${id}`)}
          >
            Nuevo turno
          </Button>
        </Box>
      </Card>

      {/* Tabs */}
      <Card sx={{ overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: '1px solid #E2E8F0',
            px: 2,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
            '& .Mui-selected': { fontWeight: 600 },
          }}
        >
          <Tab label="Datos personales" />
          <Tab label="Historia clínica" />
          <Tab label="Antecedentes" />
          <Tab label="Documentos" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ color: '#64748B', mb: 2 }}>Información personal</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Campo label="Nombre completo" value={`${paciente.nombre} ${paciente.apellido}`} />
                  <Campo label="DNI" value={paciente.dni} />
                  <Campo label="Fecha de nacimiento" value={paciente.fechaNacimiento} />
                  <Campo label="Sexo biológico" value={paciente.sexo} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ color: '#64748B', mb: 2 }}>Contacto</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Campo label="Teléfono" value={paciente.telefono} />
                  <Campo label="Email" value={paciente.email} />
                  <Campo label="Dirección" value={paciente.direccion} />
                </Box>
              </Grid>
              <Grid size={12}><Divider sx={{ borderColor: '#F1F5F9' }} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ color: '#64748B', mb: 2 }}>Cobertura médica</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Campo label="Obra social / Prepaga" value={paciente.obraSocial} />
                  <Campo label="Nro. de afiliado" value={paciente.nroAfiliado} />
                  <Campo label="Grupo sanguíneo" value={paciente.grupoSanguineo} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ color: '#64748B', mb: 2 }}>Información clínica</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Campo label="Alergias" value={paciente.alergias} />
                  <Campo label="Notas" value={paciente.notas} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {tab === 1 && <HistoriaClinica pacienteId={id} paciente={paciente} />}

        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Familiares */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ color: '#64748B', mb: 2 }}>Antecedentes familiares</Typography>
                <Grid container spacing={2}>
                  {(['padre', 'madre', 'hermanos'] as const).map((miembro) => {
                    const items = paciente.antFamiliares?.[miembro] ?? [];
                    return (
                      <Grid key={miembro} size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" sx={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                          {miembro.charAt(0).toUpperCase() + miembro.slice(1)}
                        </Typography>
                        {items.length > 0 ? (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {items.map((c) => (
                              <Chip key={c} label={c} size="small" sx={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }} />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#CBD5E1', mt: 0.5 }}>—</Typography>
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>

              <Grid size={12}><Divider sx={{ borderColor: '#F1F5F9' }} /></Grid>

              {/* Personales */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ color: '#64748B', mb: 2 }}>Antecedentes personales / quirúrgicos</Typography>
                <Grid container spacing={2}>
                  {(['cirugias', 'internaciones'] as const).map((tipo) => {
                    const items = paciente.antPersonales?.[tipo] ?? [];
                    const label = tipo === 'cirugias' ? 'Cirugías' : 'Internaciones';
                    return (
                      <Grid key={tipo} size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" sx={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                          {label}
                        </Typography>
                        {items.length > 0 ? (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {items.map((c) => (
                              <Chip key={c} label={c} size="small" sx={{ backgroundColor: '#FEE2E2', color: '#991B1B' }} />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#CBD5E1', mt: 0.5 }}>—</Typography>
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>

              <Grid size={12}><Divider sx={{ borderColor: '#F1F5F9' }} /></Grid>

              {/* Hábitos */}
              <Grid size={12}>
                <Typography variant="h6" sx={{ color: '#64748B', mb: 2 }}>Hábitos</Typography>
                {(paciente.habitos?.items ?? []).length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {paciente.habitos!.items.map((h) => (
                      <Chip
                        key={h}
                        label={HABITOS_LABELS[h] ?? h}
                        size="small"
                        sx={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#CBD5E1' }}>Sin hábitos registrados</Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {tab === 3 && (
          <Box sx={{ p: 3 }}>
            {/* Upload area */}
            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<UploadFileOutlinedIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={progreso !== null}
              >
                Subir documento
              </Button>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                PDF, imágenes — máx. 10 MB
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Box>

            {progreso !== null && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', mb: 0.5, display: 'block' }}>
                  Subiendo... {progreso}%
                </Typography>
                <LinearProgress variant="determinate" value={progreso} sx={{ borderRadius: 4 }} />
              </Box>
            )}

            {(docError || uploadError) && (
              <Alert severity="error" sx={{ mb: 2 }}>{docError ?? uploadError}</Alert>
            )}

            {docsActuales.length === 0 ? (
              <EmptyState
                titulo="Sin documentos"
                descripcion="Subí PDFs o imágenes del paciente (estudios, recetas, informes)"
                icono={<InsertDriveFileOutlinedIcon sx={{ fontSize: 'inherit' }} />}
              />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {docsActuales.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      border: '1px solid #E2E8F0',
                      borderRadius: 2,
                      '&:hover': { backgroundColor: '#F8FAFC' },
                    }}
                  >
                    <InsertDriveFileOutlinedIcon sx={{ color: '#94A3B8', fontSize: 24 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.nombre}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {new Date(doc.subidoEn).toLocaleDateString('es-AR')}
                        {doc.tamanio ? ` · ${formatBytes(doc.tamanio)}` : ''}
                      </Typography>
                    </Box>
                    <Tooltip title="Abrir">
                      <IconButton size="small" component="a" href={doc.url} target="_blank" rel="noopener noreferrer">
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Card>

      <ConfirmarDialogo
        abierto={dialogoEliminar}
        titulo="Eliminar paciente"
        descripcion={`¿Estás seguro de que deseas eliminar a ${nombreCompleto}? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        cargando={eliminando}
        onConfirmar={handleEliminar}
        onCancelar={() => setDialogoEliminar(false)}
      />
    </PageContainer>
  );
}
