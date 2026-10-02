'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import { GRUPOS_SANGUINEOS, OBRAS_SOCIALES } from '@/lib/catalogos';
import { calcularEdad } from '@/lib/fechas';
import { pedirApi } from '@/lib/api/cliente';
import type { Paciente, SexoBiologico, AntFamiliares, AntPersonales, Habitos } from '@/lib/types';
import SectionTitle from '@/components/ui/SectionTitle';

const CONDICIONES_COMUNES = [
  'Diabetes', 'Hipertensión arterial', 'Enfermedad cardiovascular', 'Cáncer',
  'Asma / EPOC', 'Enfermedad renal crónica', 'Hipotiroidismo', 'Artritis / Artrosis',
  'Depresión / Ansiedad', 'Epilepsia', 'ACV', 'Alzheimer / Demencia', 'Obesidad',
];

const CIRUGIAS_COMUNES = [
  'Apendicectomía', 'Colecistectomía', 'Hernioplastia', 'Cesárea',
  'Cirugía cardíaca', 'Cirugía de cadera / rodilla', 'Histerectomía',
  'Tiroidectomía', 'Cirugía bariátrica', 'Prostatectomía',
];

const INTERNACIONES_COMUNES = [
  'Infarto de miocardio', 'ACV', 'Neumonía', 'Fractura', 'Cirugía programada',
  'Insuficiencia cardíaca', 'Pancreatitis', 'Trauma',
];

const HABITOS_OPCIONES = [
  { value: 'tabaquismo', label: 'Tabaquismo' },
  { value: 'alcohol', label: 'Consumo de alcohol' },
  { value: 'sedentarismo', label: 'Sedentarismo' },
  { value: 'dieta_inadecuada', label: 'Dieta inadecuada' },
  { value: 'exceso_pantallas', label: 'Exceso de pantallas / Alteración del sueño' },
  { value: 'drogas', label: 'Consumo de otras sustancias' },
];

const VACIO_ANT_FAMILIARES: AntFamiliares = { padre: [], madre: [], hermanos: [] };
const VACIO_ANT_PERSONALES: AntPersonales = { cirugias: [], internaciones: [] };
const VACIO_HABITOS: Habitos = { items: [] };

type FormData = Omit<Paciente, 'id' | 'creadoEn' | 'actualizadoEn' | 'documentos'>;

const SEXO_OPCIONES: { value: SexoBiologico; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
  { value: 'no_especificado', label: 'No especificado' },
];

interface Props {
  inicial?: Partial<FormData>;
  pacienteId?: string;
  modo: 'crear' | 'editar';
}

const VACIO: FormData = {
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  sexo: 'no_especificado',
  telefono: '',
  email: '',
  direccion: '',
  obraSocial: '',
  nroAfiliado: '',
  grupoSanguineo: '',
  alergias: '',
  notas: '',
  antFamiliares: VACIO_ANT_FAMILIARES,
  antPersonales: VACIO_ANT_PERSONALES,
  habitos: VACIO_HABITOS,
};

export default function FormularioPaciente({ inicial, pacienteId, modo }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    ...VACIO,
    ...inicial,
    antFamiliares: inicial?.antFamiliares ?? VACIO_ANT_FAMILIARES,
    antPersonales: inicial?.antPersonales ?? VACIO_ANT_PERSONALES,
    habitos: inicial?.habitos ?? VACIO_HABITOS,
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [habitoOtro, setHabitoOtro] = useState('');

  function set(campo: keyof FormData, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function setAntFam(campo: keyof AntFamiliares, valor: string[]) {
    setForm((prev) => ({ ...prev, antFamiliares: { ...prev.antFamiliares!, [campo]: valor } }));
  }

  function setAntPers(campo: keyof AntPersonales, valor: string[]) {
    setForm((prev) => ({ ...prev, antPersonales: { ...prev.antPersonales!, [campo]: valor } }));
  }

  function toggleHabito(value: string) {
    setForm((prev) => {
      const items = prev.habitos?.items ?? [];
      const next = items.includes(value) ? items.filter((i) => i !== value) : [...items, value];
      return { ...prev, habitos: { items: next } };
    });
  }

  function addHabitoOtro() {
    const val = habitoOtro.trim();
    if (!val) return;
    setForm((prev) => {
      const items = prev.habitos?.items ?? [];
      if (items.includes(val)) return prev;
      return { ...prev, habitos: { items: [...items, val] } };
    });
    setHabitoOtro('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.dni || !form.telefono) {
      setError('Nombre, apellido, DNI y teléfono son requeridos');
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const url = modo === 'crear' ? '/api/pacientes' : `/api/pacientes/${pacienteId}`;
      const method = modo === 'crear' ? 'POST' : 'PUT';
      const data = await pedirApi<{ data?: { id?: string } }>(url, { metodo: method, cuerpo: form });
      setExito(true);
      setTimeout(() => {
        if (modo === 'crear') {
          router.push(`/pacientes/${data.data?.id ?? ''}`);
        } else {
          router.push(`/pacientes/${pacienteId}`);
        }
      }, 800);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {exito && <Alert severity="success" sx={{ mb: 2 }}>Paciente {modo === 'crear' ? 'creado' : 'actualizado'} correctamente</Alert>}

      <Grid container spacing={2.5}>
        {/* Datos personales */}
        <Grid size={12}>
          <Card sx={{ p: 3 }}>
            <SectionTitle>Datos personales</SectionTitle>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Nombre *" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Apellido *" value={form.apellido} onChange={(e) => set('apellido', e.target.value)} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="DNI *" value={form.dni} onChange={(e) => set('dni', e.target.value)} fullWidth required />
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
                    <Chip
                      label={calcularEdad(form.fechaNacimiento)}
                      size="small"
                      sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'var(--mint)', color: 'var(--pink)', fontSize: '0.7rem', height: 20, pointerEvents: 'none' }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Sexo biológico"
                  select
                  value={form.sexo}
                  onChange={(e) => set('sexo', e.target.value as SexoBiologico)}
                  fullWidth
                >
                  {SEXO_OPCIONES.map((op) => (
                    <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Contacto */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <SectionTitle>Contacto</SectionTitle>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField label="Teléfono *" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} fullWidth required />
              </Grid>
              <Grid size={12}>
                <TextField label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} fullWidth />
              </Grid>
              <Grid size={12}>
                <TextField label="Dirección" value={form.direccion} onChange={(e) => set('direccion', e.target.value)} fullWidth />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Obra social */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <SectionTitle>Cobertura médica</SectionTitle>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  options={OBRAS_SOCIALES}
                  value={form.obraSocial}
                  onInputChange={(_, val) => set('obraSocial', val)}
                  renderInput={(params) => (
                    <TextField {...params} label="Obra social / Prepaga" placeholder="Seleccioná o escribí…" />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <TextField label="Nro. de afiliado" value={form.nroAfiliado} onChange={(e) => set('nroAfiliado', e.target.value)} fullWidth />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Grupo sanguíneo"
                  select
                  value={form.grupoSanguineo}
                  onChange={(e) => set('grupoSanguineo', e.target.value)}
                  fullWidth
                >
                  <MenuItem value=""><em>No especificado</em></MenuItem>
                  {GRUPOS_SANGUINEOS.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Clínico */}
        <Grid size={12}>
          <Card sx={{ p: 3 }}>
            <SectionTitle>Información clínica</SectionTitle>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Alergias conocidas"
                  value={form.alergias}
                  onChange={(e) => set('alergias', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Ej: Penicilina, aspirina, látex…"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Notas adicionales"
                  value={form.notas}
                  onChange={(e) => set('notas', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Observaciones generales…"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Antecedentes familiares */}
        <Grid size={12}>
          <Accordion defaultExpanded={false} sx={{ border: '1px solid var(--line)', boxShadow: 'none', '&:before': { display: 'none' }, borderRadius: '12px !important' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FamilyRestroomIcon sx={{ color: 'var(--ink)', fontSize: 20 }} />
                <Typography variant="h6" sx={{ color: 'var(--ink)', fontWeight: 600 }}>
                  Antecedentes familiares
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <Grid container spacing={2}>
                {(['padre', 'madre', 'hermanos'] as const).map((miembro) => (
                  <Grid key={miembro} size={{ xs: 12, md: 4 }}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={CONDICIONES_COMUNES}
                      value={form.antFamiliares?.[miembro] ?? []}
                      onChange={(_, val) => setAntFam(miembro, val as string[])}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={miembro.charAt(0).toUpperCase() + miembro.slice(1)}
                          placeholder="Ej: Diabetes, Hipertensión…"
                        />
                      )}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Antecedentes personales */}
        <Grid size={12}>
          <Accordion defaultExpanded={false} sx={{ border: '1px solid var(--line)', boxShadow: 'none', '&:before': { display: 'none' }, borderRadius: '12px !important' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocalHospitalOutlinedIcon sx={{ color: 'var(--bad)', fontSize: 20 }} />
                <Typography variant="h6" sx={{ color: 'var(--ink)', fontWeight: 600 }}>
                  Antecedentes personales / quirúrgicos
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={CIRUGIAS_COMUNES}
                    value={form.antPersonales?.cirugias ?? []}
                    onChange={(_, val) => setAntPers('cirugias', val as string[])}
                    renderInput={(params) => (
                      <TextField {...params} label="Cirugías previas" placeholder="Ej: Apendicectomía…" />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={INTERNACIONES_COMUNES}
                    value={form.antPersonales?.internaciones ?? []}
                    onChange={(_, val) => setAntPers('internaciones', val as string[])}
                    renderInput={(params) => (
                      <TextField {...params} label="Internaciones previas" placeholder="Ej: Neumonía…" />
                    )}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Hábitos */}
        <Grid size={12}>
          <Accordion defaultExpanded={false} sx={{ border: '1px solid var(--line)', boxShadow: 'none', '&:before': { display: 'none' }, borderRadius: '12px !important' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SelfImprovementIcon sx={{ color: 'var(--ok)', fontSize: 20 }} />
                <Typography variant="h6" sx={{ color: 'var(--ink)', fontWeight: 600 }}>
                  Hábitos
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <FormGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 0.5 }}>
                {HABITOS_OPCIONES.map((h) => (
                  <FormControlLabel
                    key={h.value}
                    control={
                      <Checkbox
                        checked={form.habitos?.items.includes(h.value) ?? false}
                        onChange={() => toggleHabito(h.value)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{h.label}</Typography>}
                  />
                ))}
              </FormGroup>
              <Box sx={{ display: 'flex', gap: 1, mt: 2, maxWidth: 400 }}>
                <TextField
                  label="Otro hábito"
                  value={habitoOtro}
                  onChange={(e) => setHabitoOtro(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHabitoOtro(); } }}
                  size="small"
                  placeholder="Escribí y presioná Enter o Agregar"
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined" size="small" onClick={addHabitoOtro} sx={{ whiteSpace: 'nowrap' }}>
                  Agregar
                </Button>
              </Box>
              {(form.habitos?.items.filter((i) => !HABITOS_OPCIONES.map((h) => h.value).includes(i)) ?? []).length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1.5 }}>
                  {form.habitos!.items
                    .filter((i) => !HABITOS_OPCIONES.map((h) => h.value).includes(i))
                    .map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        size="small"
                        onDelete={() => toggleHabito(item)}
                        sx={{ backgroundColor: 'color-mix(in srgb, var(--ok) 18%, transparent)', color: 'var(--ok)' }}
                      />
                    ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Actions */}
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
              {cargando ? 'Guardando...' : modo === 'crear' ? 'Crear paciente' : 'Guardar cambios'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
