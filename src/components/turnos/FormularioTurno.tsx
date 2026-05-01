'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Divider from '@mui/material/Divider';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Turno, Paciente, EstadoTurno } from '@/lib/types';

const ESTADOS: { value: EstadoTurno; label: string }[] = [
  { value: 'pendiente',  label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'cancelado',  label: 'Cancelado' },
  { value: 'completado', label: 'Completado' },
  { value: 'no_asistio', label: 'No asistió' },
];

const DURACIONES = [
  { label: '15\'', min: 15 },
  { label: '30\'', min: 30 },
  { label: '45\'', min: 45 },
  { label: '1 h', min: 60 },
];

const MOTIVOS_RAPIDOS = [
  'Control de rutina',
  'Primera consulta',
  'Seguimiento',
  'Urgencia',
  'Resultado de estudio',
  'Receta',
  'Derivación',
  'Certificado médico',
];

type FormData = Omit<Turno, 'id' | 'creadoEn' | 'actualizadoEn'>;

interface Props {
  inicial?: Partial<FormData>;
  turnoId?: string;
  modo: 'crear' | 'editar';
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function manana() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

const VACIO: FormData = {
  pacienteId: '',
  pacienteNombre: '',
  fecha: hoy(),
  horaInicio: '09:00',
  horaFin: '09:30',
  motivo: '',
  estado: 'pendiente',
  notas: '',
};

export default function FormularioTurno({ inicial, turnoId, modo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormData>({ ...VACIO, ...inicial });
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [duracionActiva, setDuracionActiva] = useState<number>(30);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/pacientes')
      .then((r) => r.json())
      .then((d) => setPacientes(d.items ?? []));
    const pid = searchParams.get('pacienteId');
    if (pid) setForm((p) => ({ ...p, pacienteId: pid }));
  }, []);

  function set(campo: keyof FormData, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function aplicarDuracion(min: number) {
    setDuracionActiva(min);
    setForm((prev) => ({ ...prev, horaFin: addMinutes(prev.horaInicio, min) }));
  }

  function handleHoraInicioChange(val: string) {
    setForm((prev) => ({ ...prev, horaInicio: val, horaFin: addMinutes(val, duracionActiva) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.pacienteId || !form.fecha || !form.horaInicio || !form.motivo) {
      setError('Paciente, fecha, hora y motivo son requeridos');
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const url = modo === 'crear' ? '/api/turnos' : `/api/turnos/${turnoId}`;
      const method = modo === 'crear' ? 'POST' : 'PUT';
      const paciente = pacientes.find((p) => p.id === form.pacienteId);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pacienteNombre: paciente ? `${paciente.apellido}, ${paciente.nombre}` : form.pacienteNombre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido');
      router.push('/turnos');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  const pacienteSeleccionado = pacientes.find((p) => p.id === form.pacienteId) ?? null;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2.5}>
        <Grid size={12}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2}>

              {/* Paciente */}
              <Grid size={12}>
                <Autocomplete
                  options={pacientes}
                  getOptionLabel={(p) => `${p.apellido}, ${p.nombre} — DNI ${p.dni}`}
                  value={pacienteSeleccionado}
                  onChange={(_, v) => set('pacienteId', v?.id ?? '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Paciente *" placeholder="Buscar por nombre o DNI…" required />
                  )}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  noOptionsText="Sin resultados"
                />
              </Grid>

              {/* Fecha con shortcuts */}
              <Grid size={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
                  <TextField
                    label="Fecha *"
                    type="date"
                    value={form.fecha}
                    onChange={(e) => set('fecha', e.target.value)}
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ width: 200 }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.75, pb: 0.25 }}>
                    <Chip
                      label="Hoy"
                      size="small"
                      variant={form.fecha === hoy() ? 'filled' : 'outlined'}
                      color={form.fecha === hoy() ? 'primary' : 'default'}
                      onClick={() => set('fecha', hoy())}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label="Mañana"
                      size="small"
                      variant={form.fecha === manana() ? 'filled' : 'outlined'}
                      color={form.fecha === manana() ? 'primary' : 'default'}
                      onClick={() => set('fecha', manana())}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Hora inicio + duración */}
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  label="Hora inicio *"
                  type="time"
                  value={form.horaInicio}
                  onChange={(e) => handleHoraInicioChange(e.target.value)}
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 7 }}>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.75 }}>
                  <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                  Duración
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  {DURACIONES.map((d) => (
                    <Chip
                      key={d.min}
                      label={d.label}
                      size="small"
                      variant={duracionActiva === d.min ? 'filled' : 'outlined'}
                      color={duracionActiva === d.min ? 'primary' : 'default'}
                      onClick={() => aplicarDuracion(d.min)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                  <TextField
                    label="Fin"
                    type="time"
                    value={form.horaFin}
                    onChange={(e) => set('horaFin', e.target.value)}
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ width: 120, ml: 0.5 }}
                  />
                </Box>
              </Grid>

              <Grid size={12}>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
              </Grid>

              {/* Motivo con sugerencias rápidas */}
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label="Motivo de consulta *"
                  value={form.motivo}
                  onChange={(e) => set('motivo', e.target.value)}
                  fullWidth
                  required
                  placeholder="Describí el motivo…"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Estado"
                  select
                  value={form.estado}
                  onChange={(e) => set('estado', e.target.value as EstadoTurno)}
                  fullWidth
                >
                  {ESTADOS.map((op) => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
                </TextField>
              </Grid>

              {/* Motivos rápidos */}
              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {MOTIVOS_RAPIDOS.map((m) => (
                    <Chip
                      key={m}
                      label={m}
                      size="small"
                      variant="outlined"
                      onClick={() => set('motivo', m)}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#F0F9FF', borderColor: '#2563EB', color: '#2563EB' } }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Notas internas"
                  value={form.notas}
                  onChange={(e) => set('notas', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Observaciones del turno…"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => router.back()} disabled={cargando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              disabled={cargando}
              size="large"
            >
              {cargando ? 'Guardando...' : modo === 'crear' ? 'Crear turno' : 'Guardar cambios'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
