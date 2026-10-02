'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { pedirApi } from '@/lib/api/cliente';
import type { ItemStock } from '@/lib/types';

type FormData = Omit<ItemStock, 'id' | 'creadoEn' | 'actualizadoEn'>;

interface Props {
  inicial?: Partial<FormData>;
  itemId?: string;
  modo: 'crear' | 'editar';
}

const UBICACIONES = ['Consultorio 1', 'Consultorio 2', 'Depósito', 'Enfermería', 'Sala de espera'];

const VACIO: FormData = {
  nombre: '',
  descripcion: '',
  categoria: '',
  cantidad: 0,
  cantidadMinima: 0,
  unidad: 'unidades',
  proveedor: '',
  codigoInterno: '',
  lote: '',
  fechaVencimiento: '',
  ubicacion: '',
};

export default function FormularioStock({ inicial, itemId, modo }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ ...VACIO, ...inicial });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(campo: keyof FormData, valor: string | number) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.categoria) {
      setError('Nombre y categoría son requeridos');
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const url = modo === 'crear' ? '/api/stock' : `/api/stock/${itemId}`;
      const method = modo === 'crear' ? 'POST' : 'PUT';
      await pedirApi(url, { metodo: method, cuerpo: form });
      router.push('/stock');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2.5}>
        <Grid size={12}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField label="Nombre del item *" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Código interno" value={form.codigoInterno ?? ''} onChange={(e) => set('codigoInterno', e.target.value)} fullWidth />
              </Grid>
              <Grid size={12}>
                <TextField label="Descripción" value={form.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value)} fullWidth multiline rows={2} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Categoría *" value={form.categoria} onChange={(e) => set('categoria', e.target.value)} fullWidth required placeholder="Ej: Medicamentos, Insumos, Equipamiento…" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Unidad de medida" value={form.unidad} onChange={(e) => set('unidad', e.target.value)} fullWidth placeholder="Ej: unidades, cajas, frascos…" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Cantidad inicial"
                  type="number"
                  value={form.cantidad}
                  onChange={(e) => set('cantidad', parseInt(e.target.value) || 0)}
                  fullWidth
                  slotProps={{ htmlInput: { min: 0 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Stock mínimo"
                  type="number"
                  value={form.cantidadMinima}
                  onChange={(e) => set('cantidadMinima', parseInt(e.target.value) || 0)}
                  fullWidth
                  slotProps={{ htmlInput: { min: 0 } }}
                  helperText="Alerta cuando baje de este valor"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Proveedor" value={form.proveedor ?? ''} onChange={(e) => set('proveedor', e.target.value)} fullWidth />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ borderColor: 'var(--bg)', my: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'var(--soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Trazabilidad (opcional)
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Lote" value={form.lote ?? ''} onChange={(e) => set('lote', e.target.value)} fullWidth placeholder="Ej: LOT-2025-001" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Fecha de vencimiento"
                  type="date"
                  value={form.fechaVencimiento ?? ''}
                  onChange={(e) => set('fechaVencimiento', e.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Ubicación"
                  select
                  value={form.ubicacion ?? ''}
                  onChange={(e) => set('ubicacion', e.target.value)}
                  fullWidth
                >
                  <MenuItem value=""><em>Sin especificar</em></MenuItem>
                  {UBICACIONES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => router.back()} disabled={cargando}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveOutlinedIcon />} disabled={cargando} size="large">
              {cargando ? 'Guardando...' : modo === 'crear' ? 'Crear item' : 'Guardar cambios'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
