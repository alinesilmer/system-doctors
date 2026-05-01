'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import { usePracticas } from '@/hooks/usePracticas';
import { useTratamientos } from '@/hooks/useTratamientos';
import { usePacientes } from '@/hooks/usePacientes';
import type { Presupuesto, ItemPresupuesto, EstadoPresupuesto, Practica, Tratamiento } from '@/lib/types';

const ESTADOS: { value: EstadoPresupuesto; label: string; color: string; bg: string }[] = [
  { value: 'borrador',  label: 'Borrador',  color: '#92400E', bg: '#FEF3C7' },
  { value: 'enviado',   label: 'Enviado',   color: '#1D4ED8', bg: '#DBEAFE' },
  { value: 'aceptado',  label: 'Aceptado',  color: '#065F46', bg: '#D1FAE5' },
  { value: 'rechazado', label: 'Rechazado', color: '#991B1B', bg: '#FEE2E2' },
  { value: 'vencido',   label: 'Vencido',   color: '#475569', bg: '#F1F5F9' },
];

function formatPrecio(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

const TIPO_ICONS = {
  practica:        <LocalHospitalOutlinedIcon sx={{ fontSize: 16 }} />,
  tratamiento:     <MedicalServicesOutlinedIcon sx={{ fontSize: 16 }} />,
  examen_externo:  <ScienceOutlinedIcon sx={{ fontSize: 16 }} />,
};

const TIPO_LABELS = {
  practica:        'Práctica',
  tratamiento:     'Tratamiento',
  examen_externo:  'Examen externo',
};

const TIPO_COLORS = {
  practica:       { bg: '#DBEAFE', color: '#1D4ED8' },
  tratamiento:    { bg: '#EDE9FE', color: '#5B21B6' },
  examen_externo: { bg: '#FEF3C7', color: '#92400E' },
};

interface Props {
  modo: 'crear' | 'editar';
  inicial?: Presupuesto;
}

export default function FormularioPresupuesto({ modo, inicial }: Props) {
  const router = useRouter();
  const { practicas } = usePracticas();
  const { tratamientos } = useTratamientos();
  const { pacientes } = usePacientes();

  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Datos generales
  const [pacienteId, setPacienteId] = useState(inicial?.pacienteId ?? '');
  const [pacienteNombre, setPacienteNombre] = useState(inicial?.pacienteNombre ?? '');
  const [estado, setEstado] = useState<EstadoPresupuesto>(inicial?.estado ?? 'borrador');
  const [validoHasta, setValidoHasta] = useState(inicial?.validoHasta ?? '');
  const [notas, setNotas] = useState(inicial?.notas ?? '');
  const [descuento, setDescuento] = useState(inicial?.descuento ?? 0);

  // Ítems del presupuesto
  const [items, setItems] = useState<ItemPresupuesto[]>(inicial?.items ?? []);

  // Diálogos de agregar ítems
  const [tabAgregar, setTabAgregar] = useState(0);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  // Selección para agregar
  const [practicaSel, setPracticaSel] = useState<Practica | null>(null);
  const [tratamientoSel, setTratamientoSel] = useState<Tratamiento | null>(null);
  const [examenNombre, setExamenNombre] = useState('');
  const [examenProfesional, setExamenProfesional] = useState('');
  const [examenInstitucion, setExamenInstitucion] = useState('');
  const [examenPrecio, setExamenPrecio] = useState<number>(0);

  const subtotal = useMemo(() => items.reduce((acc, i) => acc + i.subtotal, 0), [items]);
  const total = Math.max(0, subtotal - descuento);

  function agregarPractica() {
    if (!practicaSel) return;
    setItems((prev) => [
      ...prev,
      {
        tipo: 'practica',
        referenciaId: practicaSel.id,
        nombre: practicaSel.nombre,
        descripcion: practicaSel.descripcion,
        cantidad: 1,
        precioUnitario: practicaSel.precio,
        subtotal: practicaSel.precio,
      },
    ]);
    setPracticaSel(null);
    setDialogoAbierto(false);
  }

  function agregarTratamiento() {
    if (!tratamientoSel) return;
    setItems((prev) => [
      ...prev,
      {
        tipo: 'tratamiento',
        referenciaId: tratamientoSel.id,
        nombre: tratamientoSel.nombre,
        descripcion: tratamientoSel.descripcion ?? `${tratamientoSel.practicas.length} práctica(s)`,
        cantidad: 1,
        precioUnitario: tratamientoSel.precioTotal,
        subtotal: tratamientoSel.precioTotal,
      },
    ]);
    setTratamientoSel(null);
    setDialogoAbierto(false);
  }

  function agregarExamen() {
    if (!examenNombre.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        tipo: 'examen_externo',
        nombre: examenNombre.trim(),
        descripcion: [examenProfesional, examenInstitucion].filter(Boolean).join(' — ') || undefined,
        cantidad: 1,
        precioUnitario: examenPrecio,
        subtotal: examenPrecio,
        profesional: examenProfesional || undefined,
        institucion: examenInstitucion || undefined,
      },
    ]);
    setExamenNombre('');
    setExamenProfesional('');
    setExamenInstitucion('');
    setExamenPrecio(0);
    setDialogoAbierto(false);
  }

  function actualizarCantidad(idx: number, cantidad: number) {
    if (cantidad < 1) return;
    setItems((prev) => prev.map((item, i) =>
      i === idx ? { ...item, cantidad, subtotal: cantidad * item.precioUnitario } : item
    ));
  }

  function actualizarPrecio(idx: number, precio: number) {
    setItems((prev) => prev.map((item, i) =>
      i === idx ? { ...item, precioUnitario: precio, subtotal: item.cantidad * precio } : item
    ));
  }

  function quitarItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function abrirDialogo() {
    setPracticaSel(null);
    setTratamientoSel(null);
    setExamenNombre('');
    setExamenProfesional('');
    setExamenInstitucion('');
    setExamenPrecio(0);
    setDialogoAbierto(true);
  }

  async function handleGuardar() {
    setErrorMsg(null);
    if (items.length === 0) { setErrorMsg('El presupuesto debe tener al menos un ítem'); return; }

    setGuardando(true);
    try {
      const payload: Omit<Presupuesto, 'id' | 'creadoEn' | 'actualizadoEn'> = {
        pacienteId: pacienteId || undefined,
        pacienteNombre: pacienteNombre || undefined,
        items,
        subtotal,
        descuento,
        total,
        validoHasta: validoHasta || undefined,
        estado,
        notas: notas.trim() || undefined,
      };

      const res = modo === 'crear'
        ? await fetch('/api/presupuestos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch(`/api/presupuestos/${inicial!.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error al guardar');
      }
      router.push('/presupuestos');
      router.refresh();
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1000 }}>
      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      {/* Datos generales */}
      <Card>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
            Datos del presupuesto
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Autocomplete
              options={pacientes}
              getOptionLabel={(p) => `${p.apellido}, ${p.nombre} — DNI ${p.dni}`}
              value={pacientes.find((p) => p.id === pacienteId) ?? null}
              onChange={(_e, val) => {
                setPacienteId(val?.id ?? '');
                setPacienteNombre(val ? `${val.nombre} ${val.apellido}` : '');
              }}
              renderInput={(params) => <TextField {...params} label="Paciente (opcional)" />}
            />
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select label="Estado" value={estado} onChange={(e) => setEstado(e.target.value as EstadoPresupuesto)}>
                {ESTADOS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color }} />
                      {s.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Válido hasta"
              type="date"
              value={validoHasta}
              onChange={(e) => setValidoHasta(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          <TextField
            label="Notas internas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Observaciones, condiciones especiales, etc."
          />
        </CardContent>
      </Card>

      {/* Ítems */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
              Ítems del presupuesto
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={abrirDialogo} size="small">
              Agregar ítem
            </Button>
          </Box>

          {items.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                Aún no se agregaron ítems al presupuesto
              </Typography>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={abrirDialogo}>
                Agregar primer ítem
              </Button>
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="center" sx={{ width: 90 }}>Cant.</TableCell>
                    <TableCell align="right" sx={{ width: 140 }}>Precio unit.</TableCell>
                    <TableCell align="right" sx={{ width: 120 }}>Subtotal</TableCell>
                    <TableCell align="center" sx={{ width: 50 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, idx) => {
                    const tipoStyle = TIPO_COLORS[item.tipo];
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.nombre}</Typography>
                          {item.descripcion && (
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>{item.descripcion}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={TIPO_ICONS[item.tipo]}
                            label={TIPO_LABELS[item.tipo]}
                            size="small"
                            sx={{ backgroundColor: tipoStyle.bg, color: tipoStyle.color, fontWeight: 600, fontSize: '0.65rem' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => actualizarCantidad(idx, parseInt(e.target.value) || 1)}
                            size="small"
                            sx={{ width: 70 }}
                            slotProps={{ htmlInput: { min: 1, style: { textAlign: 'center' } } }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={item.precioUnitario}
                            onChange={(e) => actualizarPrecio(idx, parseFloat(e.target.value) || 0)}
                            size="small"
                            sx={{ width: 120 }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {formatPrecio(item.subtotal)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Quitar">
                            <IconButton size="small" sx={{ color: '#EF4444' }} onClick={() => quitarItem(idx)}>
                              <DeleteOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 260 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Subtotal</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrecio(subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Descuento</Typography>
                    <TextField
                      type="number"
                      value={descuento}
                      onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                      size="small"
                      sx={{ width: 140 }}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>TOTAL</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#2563EB' }}>
                      {formatPrecio(total)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.push('/presupuestos')} disabled={guardando}>
          Cancelar
        </Button>
        <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={handleGuardar} loading={guardando}>
          {modo === 'crear' ? 'Guardar presupuesto' : 'Guardar cambios'}
        </Button>
      </Box>

      {/* Diálogo para agregar ítems */}
      <Dialog open={dialogoAbierto} onClose={() => setDialogoAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar ítem al presupuesto</DialogTitle>
        <DialogContent>
          <Tabs value={tabAgregar} onChange={(_e, v) => setTabAgregar(v)} sx={{ mb: 2, borderBottom: '1px solid #E2E8F0' }}>
            <Tab icon={<LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Práctica" />
            <Tab icon={<MedicalServicesOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Tratamiento" />
            <Tab icon={<ScienceOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Examen externo" />
          </Tabs>

          {tabAgregar === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Autocomplete
                options={practicas.filter((p) => p.activa)}
                getOptionLabel={(p) => p.nombre}
                renderOption={(props, p) => (
                  <li {...props} key={p.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.nombre}</Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {p.categoria && `${p.categoria} · `}{formatPrecio(p.precio)}
                      </Typography>
                    </Box>
                  </li>
                )}
                value={practicaSel}
                onChange={(_e, val) => setPracticaSel(val)}
                renderInput={(params) => <TextField {...params} label="Seleccioná una práctica" autoFocus />}
              />
              {practicaSel && (
                <Box sx={{ p: 2, backgroundColor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{practicaSel.nombre}</Typography>
                  <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 700, mt: 0.5 }}>
                    {formatPrecio(practicaSel.precio)}
                  </Typography>
                  {practicaSel.descripcion && (
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{practicaSel.descripcion}</Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          {tabAgregar === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Autocomplete
                options={tratamientos.filter((t) => t.activo)}
                getOptionLabel={(t) => t.nombre}
                renderOption={(props, t) => (
                  <li {...props} key={t.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.nombre}</Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {t.practicas.length} práctica(s) · {formatPrecio(t.precioTotal)}
                      </Typography>
                    </Box>
                  </li>
                )}
                value={tratamientoSel}
                onChange={(_e, val) => setTratamientoSel(val)}
                renderInput={(params) => <TextField {...params} label="Seleccioná un tratamiento" autoFocus />}
              />
              {tratamientoSel && (
                <Box sx={{ p: 2, backgroundColor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{tratamientoSel.nombre}</Typography>
                  <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 700, mt: 0.5 }}>
                    {formatPrecio(tratamientoSel.precioTotal)}
                  </Typography>
                  {tratamientoSel.practicas.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {tratamientoSel.practicas.map((p) => (
                        <Typography key={p.practicaId} variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          • {p.practicaNombre} × {p.cantidad} — {formatPrecio(p.subtotal)}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}

          {tabAgregar === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Nombre del estudio o examen *"
                value={examenNombre}
                onChange={(e) => setExamenNombre(e.target.value)}
                fullWidth
                autoFocus
                placeholder="Ej: Resonancia magnética de rodilla"
              />
              <TextField
                label="Profesional / Especialista"
                value={examenProfesional}
                onChange={(e) => setExamenProfesional(e.target.value)}
                fullWidth
                placeholder="Ej: Dr. García — Traumatología"
              />
              <TextField
                label="Institución / Centro médico"
                value={examenInstitucion}
                onChange={(e) => setExamenInstitucion(e.target.value)}
                fullWidth
                placeholder="Ej: Hospital Italiano"
              />
              <TextField
                label="Precio estimado"
                type="number"
                value={examenPrecio}
                onChange={(e) => setExamenPrecio(parseFloat(e.target.value) || 0)}
                fullWidth
                slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogoAbierto(false)}>Cancelar</Button>
          {tabAgregar === 0 && (
            <Button variant="contained" onClick={agregarPractica} disabled={!practicaSel}>
              Agregar práctica
            </Button>
          )}
          {tabAgregar === 1 && (
            <Button variant="contained" onClick={agregarTratamiento} disabled={!tratamientoSel}>
              Agregar tratamiento
            </Button>
          )}
          {tabAgregar === 2 && (
            <Button variant="contained" onClick={agregarExamen} disabled={!examenNombre.trim()}>
              Agregar examen
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
