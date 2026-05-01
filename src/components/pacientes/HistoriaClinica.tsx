'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CloseIcon from '@mui/icons-material/Close';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ChatIA from '@/components/ai/ChatIA';
import type { EntradaHistoriaClinica, Paciente } from '@/lib/types';

const TIPOS: { value: EntradaHistoriaClinica['tipo']; label: string; color: string; bg: string }[] = [
  { value: 'consulta',   label: 'Consulta',   color: '#1E40AF', bg: '#DBEAFE' },
  { value: 'estudio',    label: 'Estudio',    color: '#065F46', bg: '#D1FAE5' },
  { value: 'receta',     label: 'Receta',     color: '#5B21B6', bg: '#EDE9FE' },
  { value: 'nota',       label: 'Nota',       color: '#374151', bg: '#F3F4F6' },
  { value: 'derivacion', label: 'Derivación', color: '#92400E', bg: '#FEF3C7' },
];

function tipoConfig(tipo: EntradaHistoriaClinica['tipo']) {
  return TIPOS.find((t) => t.value === tipo) ?? TIPOS[0];
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const FORM_VACIO = {
  tipo: 'consulta' as EntradaHistoriaClinica['tipo'],
  titulo: '',
  contenido: '',
  fecha: new Date().toISOString().slice(0, 10),
};

export default function HistoriaClinica({ pacienteId, paciente }: { pacienteId: string; paciente?: Paciente }) {
  const [entradas, setEntradas] = useState<EntradaHistoriaClinica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);

  async function cargar() {
    setCargando(true);
    try {
      const res = await fetch(`/api/pacientes/${pacienteId}/historia-clinica`);
      const data = await res.json();
      setEntradas(data.items ?? []);
    } catch { setError('Error al cargar historia clínica'); }
    finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, [pacienteId]);

  async function guardar() {
    if (!form.titulo || !form.contenido) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/pacientes/${pacienteId}/historia-clinica`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setDialogo(false);
      setForm(FORM_VACIO);
      cargar();
    } catch { setError('Error al guardar entrada'); }
    finally { setGuardando(false); }
  }

  function abrirConNota(nota: { titulo: string; contenido: string }) {
    setChatAbierto(false);
    setForm((prev) => ({ ...prev, tipo: 'consulta', titulo: nota.titulo, contenido: nota.contenido }));
    setDialogo(true);
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ color: '#0F172A' }}>Historia Clínica</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SmartToyOutlinedIcon />}
            onClick={() => setChatAbierto(true)}
            size="small"
            sx={{ borderColor: '#7C3AED', color: '#7C3AED', '&:hover': { borderColor: '#6D28D9', backgroundColor: '#F3F0FF' } }}
          >
            Asistente IA
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogo(true)} size="small">
            Nueva entrada
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {cargando ? (
        <LoadingScreen />
      ) : entradas.length === 0 ? (
        <EmptyState
          titulo="Sin entradas aún"
          descripcion="Agregá la primera entrada a la historia clínica o usá el Asistente IA para dictarla"
          icono={<MedicalServicesOutlinedIcon sx={{ fontSize: 'inherit' }} />}
          accion={{ label: 'Nueva entrada', onClick: () => setDialogo(true) }}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {entradas.map((entrada, i) => {
            const cfg = tipoConfig(entrada.tipo);
            return (
              <Box key={entrada.id} sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0, mt: 0.5 }} />
                  {i < entradas.length - 1 && (
                    <Box sx={{ width: 2, flex: 1, backgroundColor: '#E2E8F0', my: 0.5 }} />
                  )}
                </Box>
                <Box sx={{ flex: 1, pb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                    <Chip
                      label={cfg.label}
                      size="small"
                      sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.65rem', height: 20 }}
                    />
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      {formatFecha(entrada.fecha || entrada.creadoEn)}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ color: '#0F172A', mb: 0.5 }}>{entrada.titulo}</Typography>
                  <Typography variant="body2" sx={{ color: '#475569', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {entrada.contenido}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Nueva entrada dialog */}
      <Dialog open={dialogo} onClose={() => setDialogo(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Nueva entrada en historia clínica</DialogTitle>
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '1px solid #E2E8F0' }}>
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
