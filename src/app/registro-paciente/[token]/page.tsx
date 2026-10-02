'use client';

import { use, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { GRUPOS_SANGUINEOS, OBRAS_SOCIALES } from '@/lib/catalogos';
import { calcularEdad } from '@/lib/fechas';
import { pedirApi } from '@/lib/api/cliente';
import type { SexoBiologico } from '@/lib/types';

const SEXO_OPCIONES: { value: SexoBiologico; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
  { value: 'no_especificado', label: 'Prefiero no decir' },
];

const VACIO = {
  nombre: '', apellido: '', dni: '', fechaNacimiento: '',
  sexo: 'no_especificado' as SexoBiologico,
  telefono: '', email: '', direccion: '',
  obraSocial: '', nroAfiliado: '', grupoSanguineo: '',
  alergias: '', notas: '',
};

export default function RegistroPacientePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [estado, setEstado] = useState<'verificando' | 'activo' | 'completado' | 'invalido'>('verificando');
  const [form, setForm] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pedirApi<{ data?: { estado?: string } }>(`/api/invitaciones/${token}`)
      .then((d) => setEstado(d.data?.estado === 'pendiente' ? 'activo' : 'completado'))
      .catch(() => setEstado('invalido'));
  }, [token]);

  function set(campo: keyof typeof VACIO, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.dni || !form.telefono) {
      setError('Nombre, apellido, DNI y teléfono son obligatorios');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await pedirApi(`/api/invitaciones/${token}`, { metodo: 'POST', cuerpo: form, mensajeError: 'Error al enviar' });
      setEstado('completado');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  if (estado === 'verificando') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (estado === 'invalido') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', p: 2 }}>
        <Card sx={{ p: 4, maxWidth: 420, textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 56, color: 'var(--bad)', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1, color: 'var(--ink)' }}>Enlace inválido</Typography>
          <Typography variant="body2" sx={{ color: 'var(--soft)' }}>
            Este enlace no existe o ha expirado. Solicitá uno nuevo a tu médico.
          </Typography>
        </Card>
      </Box>
    );
  }

  if (estado === 'completado') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', p: 2 }}>
        <Card sx={{ p: 4, maxWidth: 420, textAlign: 'center' }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 56, color: 'var(--ok)', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1, color: 'var(--ink)' }}>¡Datos recibidos!</Typography>
          <Typography variant="body2" sx={{ color: 'var(--soft)' }}>
            Tu información fue enviada correctamente. El médico revisará tus datos y te dará el turno.
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'var(--bg)', py: 4, px: 2 }}>
      <Box sx={{ maxWidth: 680, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: 'var(--ink)', fontWeight: 700, mb: 0.5 }}>
            Formulario de registro
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--soft)' }}>
            Completá tus datos para que tu médico pueda atenderte. Todo es confidencial.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2.5}>
            {/* Datos personales */}
            <Grid size={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: 'var(--soft)', fontWeight: 600, mb: 1 }}>Datos personales</Typography>
                <Divider sx={{ mb: 2, borderColor: 'var(--bg)' }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Nombre *" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} fullWidth required />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Apellido *" value={form.apellido} onChange={(e) => set('apellido', e.target.value)} fullWidth required />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField label="DNI *" value={form.dni} onChange={(e) => set('dni', e.target.value.replace(/\D/g, ''))} fullWidth required inputMode="numeric" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        label="Fecha de nacimiento"
                        type="date"
                        value={form.fechaNacimiento}
                        onChange={(e) => set('fechaNacimiento', e.target.value)}
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                      {calcularEdad(form.fechaNacimiento) && (
                        <Chip label={calcularEdad(form.fechaNacimiento)} size="small" sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'var(--mint)', color: 'var(--pink)', fontSize: '0.7rem', height: 20, pointerEvents: 'none' }} />
                      )}
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField label="Sexo biológico" select value={form.sexo} onChange={(e) => set('sexo', e.target.value)} fullWidth>
                      {SEXO_OPCIONES.map((op) => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Contacto */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ color: 'var(--soft)', fontWeight: 600, mb: 1 }}>Contacto</Typography>
                <Divider sx={{ mb: 2, borderColor: 'var(--bg)' }} />
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField label="Teléfono *" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} fullWidth required inputMode="tel" />
                  </Grid>
                  <Grid size={12}>
                    <TextField label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} fullWidth inputMode="email" />
                  </Grid>
                  <Grid size={12}>
                    <TextField label="Dirección" value={form.direccion} onChange={(e) => set('direccion', e.target.value)} fullWidth />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Cobertura */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ color: 'var(--soft)', fontWeight: 600, mb: 1 }}>Cobertura médica</Typography>
                <Divider sx={{ mb: 2, borderColor: 'var(--bg)' }} />
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Autocomplete
                      freeSolo
                      options={OBRAS_SOCIALES}
                      value={form.obraSocial}
                      onInputChange={(_, val) => set('obraSocial', val)}
                      renderInput={(params) => <TextField {...params} label="Obra social / Prepaga" />}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField label="Nro. de afiliado" value={form.nroAfiliado} onChange={(e) => set('nroAfiliado', e.target.value)} fullWidth />
                  </Grid>
                  <Grid size={12}>
                    <TextField label="Grupo sanguíneo" select value={form.grupoSanguineo} onChange={(e) => set('grupoSanguineo', e.target.value)} fullWidth>
                      <MenuItem value=""><em>No sé / No especificado</em></MenuItem>
                      {GRUPOS_SANGUINEOS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Clínico */}
            <Grid size={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: 'var(--soft)', fontWeight: 600, mb: 1 }}>Información clínica</Typography>
                <Divider sx={{ mb: 2, borderColor: 'var(--bg)' }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField label="Alergias conocidas" value={form.alergias} onChange={(e) => set('alergias', e.target.value)} fullWidth multiline rows={3} placeholder="Ej: Penicilina, aspirina, látex…" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField label="Notas adicionales" value={form.notas} onChange={(e) => set('notas', e.target.value)} fullWidth multiline rows={3} placeholder="Condiciones crónicas, medicación habitual…" />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            <Grid size={12}>
              <Button type="submit" variant="contained" size="large" fullWidth disabled={enviando} sx={{ py: 1.5, fontSize: '1rem' }}>
                {enviando ? 'Enviando...' : 'Enviar mis datos'}
              </Button>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'var(--soft)' }}>
                Tus datos se envían de forma segura y solo son accesibles por tu médico.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
