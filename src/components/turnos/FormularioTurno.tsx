'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Divider from '@mui/material/Divider';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SelectorHora, { aHora, aMinutos } from './SelectorHora';
import Etiqueta from '@/components/ui/Etiqueta';
import { useAhora } from '@/hooks/useAhora';
import { useColeccion } from '@/hooks/useRecurso';
import { usePacientes } from '@/hooks/usePacientes';
import { pedirApi } from '@/lib/api/cliente';
import { horaActual, hoyIso, mananaIso } from '@/lib/fechas';
import type { Turno, EstadoTurno } from '@/lib/types';

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
  fecha: hoyIso(),
  horaInicio: '09:00',
  horaFin: '09:30',
  motivo: '',
  estado: 'pendiente',
  notas: '',
};

/** Para un turno nuevo de hoy: la próxima media hora libre de reloj, no un horario que ya pasó. */
function horarioSugerido(): Pick<FormData, 'horaInicio' | 'horaFin'> | undefined {
  const siguiente = Math.ceil((aMinutos(horaActual()) + 1) / 30) * 30;
  if (siguiente < 8 * 60 || siguiente >= 20 * 60) return undefined;
  return { horaInicio: aHora(siguiente), horaFin: aHora(siguiente + 30) };
}

export default function FormularioTurno({ inicial, turnoId, modo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Al llegar desde la ficha de un paciente, el turno arranca con ese paciente puesto.
  const pacienteDesdeUrl = searchParams.get('pacienteId');
  const [form, setForm] = useState<FormData>({
    ...VACIO,
    ...horarioSugerido(),
    ...(pacienteDesdeUrl ? { pacienteId: pacienteDesdeUrl } : {}),
    ...inicial,
  });
  const { pacientes } = usePacientes();
  // Al editar, la duración es la que ya tenía el turno.
  const [duracionActiva, setDuracionActiva] = useState<number>(() => {
    const minutos = form.horaFin ? aMinutos(form.horaFin) - aMinutos(form.horaInicio) : 0;
    return minutos > 0 ? minutos : 30;
  });
  const ahora = useAhora();

  // Lo ya agendado ese día (menos este mismo turno) deja sus horarios fuera de juego.
  const { items: delDia } = useColeccion<Turno>(`/api/turnos?desde=${form.fecha}&hasta=${form.fecha}`, 'Error al cargar turnos');
  const ocupados = delDia
    .filter((t) => t.id !== turnoId && t.estado !== 'cancelado')
    .map((t) => ({ inicio: t.horaInicio, fin: t.horaFin || t.horaInicio }));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await pedirApi(url, { metodo: method, cuerpo: { ...form, pacienteNombre: paciente ? `${paciente.apellido}, ${paciente.nombre}` : form.pacienteNombre } });
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
                    <TextField {...params} label="Paciente" placeholder="Buscar por nombre o DNI…" required />
                  )}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  noOptionsText="Sin resultados"
                />
              </Grid>

              {/* Fecha con shortcuts */}
              <Grid size={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
                  <TextField
                    label="Fecha"
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
                      variant={form.fecha === hoyIso() ? 'filled' : 'outlined'}
                      color={form.fecha === hoyIso() ? 'primary' : 'default'}
                      onClick={() => set('fecha', hoyIso())}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label="Mañana"
                      size="small"
                      variant={form.fecha === mananaIso() ? 'filled' : 'outlined'}
                      color={form.fecha === mananaIso() ? 'primary' : 'default'}
                      onClick={() => set('fecha', mananaIso())}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Duración: de ella sale la hora de fin, que no hace falta cargar. */}
              <Grid size={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {DURACIONES.map((d) => (
                    <Chip
                      key={d.min}
                      label={d.label}
                      variant={duracionActiva === d.min ? 'filled' : 'outlined'}
                      color={duracionActiva === d.min ? 'primary' : 'default'}
                      onClick={() => aplicarDuracion(d.min)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                  <Box sx={{ ml: 'auto' }}>
                    <Etiqueta tono="acento">{form.horaInicio} – {form.horaFin}</Etiqueta>
                  </Box>
                </Box>
              </Grid>

              {/* Hora: todos los horarios del día a un toque. */}
              <Grid size={12}>
                <SelectorHora
                  valor={form.horaInicio}
                  onCambio={handleHoraInicioChange}
                  duracion={duracionActiva}
                  ocupados={ocupados}
                  desde={form.fecha === hoyIso() ? ahora : undefined}
                />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ borderColor: 'var(--bg)' }} />
              </Grid>

              {/* Motivo con sugerencias rápidas */}
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label="Motivo"
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
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'var(--mint)', borderColor: 'var(--pink)', color: 'var(--pink)' } }}
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
