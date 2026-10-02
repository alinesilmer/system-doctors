'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import ForwardRoundedIcon from '@mui/icons-material/ForwardRounded';
import CloseIcon from '@mui/icons-material/Close';
import { pedirApi } from '@/lib/api/cliente';
import { fechaCorta, hoyIso } from '@/lib/fechas';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { EstetoscopioIcon } from '@/components/ui/iconos';
import Pildora from '@/components/ui/Pildora';
import { Camino, Parada } from '@/components/ui/Camino';
import ChatIA from '@/components/ai/ChatIA';
import type { EntradaHistoriaClinica, Paciente } from '@/lib/types';
import { useColeccion } from '@/hooks/useRecurso';

const TIPOS: { value: EntradaHistoriaClinica['tipo']; label: string; tono: string; icono: React.ReactNode }[] = [
  { value: 'consulta',   label: 'Consulta',   tono: 'var(--sun)',  icono: <EstetoscopioIcon /> },
  { value: 'estudio',    label: 'Estudio',    tono: 'var(--mint)', icono: <ScienceRoundedIcon /> },
  { value: 'receta',     label: 'Receta',     tono: 'var(--lila)', icono: <MedicationRoundedIcon /> },
  { value: 'nota',       label: 'Nota',       tono: 'var(--bg)',   icono: <EditNoteRoundedIcon /> },
  { value: 'derivacion', label: 'Derivación', tono: 'var(--mint)', icono: <ForwardRoundedIcon /> },
];

function tipoConfig(tipo: EntradaHistoriaClinica['tipo']) {
  return TIPOS.find((t) => t.value === tipo) ?? TIPOS[0];
}

// Función y no constante: la fecha por defecto es la del día en que se abre el formulario.
const formVacio = () => ({
  tipo: 'consulta' as EntradaHistoriaClinica['tipo'],
  titulo: '',
  contenido: '',
  fecha: hoyIso(),
});

export default function HistoriaClinica({ pacienteId, paciente }: { pacienteId: string; paciente?: Paciente }) {
  const {
    items: entradas, cargando, error: errorCarga, recargar,
  } = useColeccion<EntradaHistoriaClinica>(
    `/api/pacientes/${pacienteId}/historia-clinica`,
    'Error al cargar historia clínica',
  );
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const error = errorGuardado ?? errorCarga;
  const [dialogo, setDialogo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [expandida, setExpandida] = useState<string | null>(null);

  async function guardar() {
    if (!form.titulo || !form.contenido) return;
    setGuardando(true);
    try {
      await pedirApi(`/api/pacientes/${pacienteId}/historia-clinica`, { metodo: 'POST', cuerpo: form });
      setDialogo(false);
      setForm(formVacio());
      await recargar();
    } catch { setErrorGuardado('Error al guardar entrada'); }
    finally { setGuardando(false); }
  }

  function abrirConNota(nota: { titulo: string; contenido: string }) {
    setChatAbierto(false);
    setForm((prev) => ({ ...prev, tipo: 'consulta', titulo: nota.titulo, contenido: nota.contenido }));
    setDialogo(true);
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
        <Pildora onClick={() => setDialogo(true)}>Nota</Pildora>
        <Button variant="outlined" startIcon={<AutoAwesomeRoundedIcon />} onClick={() => setChatAbierto(true)}>
          Dictar con IA
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {cargando ? (
        <LoadingScreen />
      ) : entradas.length === 0 ? (
        <EmptyState titulo="Historia en blanco" descripcion="Escribí o dictá la primera nota." icono={<EstetoscopioIcon fontSize="inherit" />} />
      ) : (
        <Camino>
          {entradas.map((entrada, i) => {
            const cfg = tipoConfig(entrada.tipo);
            const abierta = expandida === entrada.id;
            return (
              <Parada
                key={entrada.id}
                orden={Math.min(i, 10)}
                estado="hecha"
                icono={cfg.icono}
                tono={cfg.tono}
                titulo={entrada.titulo}
                detalle={
                  <>
                    {cfg.label} · {fechaCorta(entrada.fecha || entrada.creadoEn)}
                    <Box
                      component="button"
                      onClick={() => setExpandida(abierta ? null : entrada.id)}
                      aria-expanded={abierta}
                      sx={{
                        display: 'block', width: '100%', mt: 0.5, p: 0, border: 0, background: 'none', cursor: 'pointer',
                        font: 'inherit', color: 'var(--ink)', textAlign: 'left', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                        // Cerrada muestra dos líneas; un toque la despliega entera.
                        ...(!abierta && { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
                      }}
                    >
                      {entrada.contenido}
                    </Box>
                  </>
                }
              />
            );
          })}
        </Camino>
      )}

      {/* Nueva entrada dialog */}
      <Dialog open={dialogo} onClose={() => setDialogo(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Nueva nota</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Tipo"
              select
              value={form.tipo}
              onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as EntradaHistoriaClinica['tipo'] }))}
              sx={{ minWidth: 160 }}
              size="small"
            >
              {TIPOS.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            <TextField
              label="Fecha"
              type="date"
              value={form.fecha}
              onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>
          <TextField
            label="Título *"
            value={form.titulo}
            onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
            fullWidth
            size="small"
          />
          <TextField
            label="Contenido *"
            value={form.contenido}
            onChange={(e) => setForm((p) => ({ ...p, contenido: e.target.value }))}
            fullWidth
            multiline
            rows={8}
            size="small"
            placeholder="Descripción detallada de la consulta, diagnóstico, indicaciones…"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDialogo(false)} disabled={guardando}>Cancelar</Button>
          <Button variant="contained" onClick={guardar} disabled={guardando || !form.titulo || !form.contenido}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Chat Drawer */}
      <Drawer
        anchor="right"
        open={chatAbierto}
        onClose={() => setChatAbierto(false)}
        slotProps={{ paper: { sx: { width: { xs: '100%', sm: 420 }, display: 'flex', flexDirection: 'column' } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '3px dotted var(--line)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Asistente IA</Typography>
          <IconButton size="small" onClick={() => setChatAbierto(false)}><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {paciente ? (
            <ChatIA paciente={paciente} onGuardarNota={abrirConNota} />
          ) : (
            <Box sx={{ p: 3 }}>
              <Alert severity="info">Cargando datos del paciente…</Alert>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
