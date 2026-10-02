'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import { CruzMedicaIcon } from '@/components/ui/iconos';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Listado from '@/components/ui/Listado';
import Fila, { eliminar } from '@/components/ui/Fila';
import Etiqueta from '@/components/ui/Etiqueta';
import DialogoEliminar from '@/components/ui/DialogoEliminar';
import { pedirApi } from '@/lib/api/cliente';
import type { DatosNuevos } from '@/lib/entidad';
import { formatPrecio } from '@/lib/formato';
import { useEliminar } from '@/hooks/useEliminar';
import { usePracticas } from '@/hooks/usePracticas';
import type { Practica } from '@/lib/types';

const PRACTICA_VACIA: DatosNuevos<Practica> = {
  nombre: '', descripcion: '', precio: 0, duracionMinutos: undefined, categoria: '', activa: true,
};

export default function PracticasPage() {
  const { practicas, cargando, error, recargar } = usePracticas();
  const eliminacion = useEliminar<Practica>((p) => `/api/practicas/${p.id}`, recargar);
  // `null` = cerrado; `{ practica: null }` = alta; con práctica = edición.
  const [dialogo, setDialogo] = useState<{ practica: Practica | null } | null>(null);
  const [form, setForm] = useState(PRACTICA_VACIA);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  function abrir(practica: Practica | null) {
    setForm(practica
      ? { nombre: practica.nombre, descripcion: practica.descripcion ?? '', precio: practica.precio, duracionMinutos: practica.duracionMinutos, categoria: practica.categoria ?? '', activa: practica.activa }
      : PRACTICA_VACIA);
    setErrorForm(null);
    setDialogo({ practica });
  }

  async function guardar() {
    if (!dialogo) return;
    if (!form.nombre.trim()) { setErrorForm('Falta el nombre'); return; }
    setGuardando(true);
    setErrorForm(null);
    try {
      const { practica } = dialogo;
      await pedirApi(practica ? `/api/practicas/${practica.id}` : '/api/practicas', {
        metodo: practica ? 'PATCH' : 'POST',
        // Los textos van siempre (aunque vacíos) para que también se puedan borrar al editar.
        cuerpo: { ...form, nombre: form.nombre.trim(), descripcion: form.descripcion?.trim() ?? '', categoria: form.categoria?.trim() ?? '' },
        mensajeError: 'No se pudo guardar',
      });
      setDialogo(null);
      await recargar();
    } catch (e) {
      setErrorForm((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Listado
      titulo="Prácticas"
      volver="/mas"
      nuevo={{ label: 'Práctica', onClick: () => abrir(null) }}
      items={practicas}
      cargando={cargando}
      error={error}
      buscar={{ ayuda: 'Buscar práctica', en: (p) => [p.nombre, p.categoria, p.descripcion] }}
      vacio={{ titulo: 'Sin prácticas', descripcion: 'Cargá lo que ofrecés y su precio.', icono: <CruzMedicaIcon fontSize="inherit" /> }}
      fila={(p, i) => (
        <Fila
          key={p.id}
          orden={i}
          icono={<CruzMedicaIcon />}
          titulo={p.nombre}
          detalle={[p.categoria, p.duracionMinutos && `${p.duracionMinutos} min`].filter(Boolean).join(' · ')}
          etiquetas={!p.activa && <Etiqueta>Inactiva</Etiqueta>}
          valor={formatPrecio(p.precio)}
          acciones={[
            { titulo: 'Editar', icono: <EditRoundedIcon fontSize="small" />, onClick: () => abrir(p) },
            eliminar(() => eliminacion.pedir(p)),
          ]}
        />
      )}
    >
      <Dialog open={!!dialogo} onClose={() => setDialogo(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{dialogo?.practica ? 'Editar práctica' : 'Nueva práctica'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {errorForm && <Alert severity="error">{errorForm}</Alert>}
            <TextField label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} fullWidth autoFocus />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Precio"
                type="number"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> }, htmlInput: { min: 0 } }}
              />
              <TextField
                label="Duración"
                type="number"
                value={form.duracionMinutos ?? ''}
                onChange={(e) => setForm({ ...form, duracionMinutos: e.target.value ? parseInt(e.target.value) : undefined })}
                slotProps={{ input: { endAdornment: <InputAdornment position="end">min</InputAdornment> }, htmlInput: { min: 0 } }}
              />
            </Box>
            <TextField label="Categoría" value={form.categoria ?? ''} onChange={(e) => setForm({ ...form, categoria: e.target.value })} fullWidth />
            <TextField label="Descripción" value={form.descripcion ?? ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} fullWidth multiline rows={2} />
            <FormControlLabel
              control={<Switch checked={form.activa} onChange={(e) => setForm({ ...form, activa: e.target.checked })} />}
              label="Activa"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDialogo(null)} disabled={guardando}>Cancelar</Button>
          <Button variant="contained" onClick={guardar} disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>

      <DialogoEliminar eliminacion={eliminacion} que="práctica" nombre={(p) => p.nombre} />
    </Listado>
  );
}
