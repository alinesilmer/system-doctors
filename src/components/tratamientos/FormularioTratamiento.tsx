'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { pedirApi } from '@/lib/api/cliente';
import { formatPrecio } from '@/lib/formato';
import { usePracticas } from '@/hooks/usePracticas';
import type { Tratamiento, ItemTratamiento, Practica } from '@/lib/types';

interface Props {
  modo: 'crear' | 'editar';
  inicial?: Tratamiento;
}

export default function FormularioTratamiento({ modo, inicial }: Props) {
  const router = useRouter();
  const { practicas } = usePracticas();
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '');
  const [practicasSeleccionadas, setPracticasSeleccionadas] = useState<ItemTratamiento[]>(inicial?.practicas ?? []);
  const [activo, setActivo] = useState(inicial?.activo ?? true);

  const [practicaAgregar, setPracticaAgregar] = useState<Practica | null>(null);

  const precioTotal = practicasSeleccionadas.reduce((acc, p) => acc + p.subtotal, 0);

  function agregarPractica() {
    if (!practicaAgregar) return;
    const existe = practicasSeleccionadas.find((p) => p.practicaId === practicaAgregar.id);
    if (existe) {
      setPracticasSeleccionadas(practicasSeleccionadas.map((p) =>
        p.practicaId === practicaAgregar.id
          ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precioUnitario }
          : p
      ));
    } else {
      setPracticasSeleccionadas([
        ...practicasSeleccionadas,
        {
          practicaId: practicaAgregar.id,
          practicaNombre: practicaAgregar.nombre,
          cantidad: 1,
          precioUnitario: practicaAgregar.precio,
          subtotal: practicaAgregar.precio,
        },
      ]);
    }
    setPracticaAgregar(null);
  }

  function actualizarCantidad(practicaId: string, cantidad: number) {
    if (cantidad < 1) return;
    setPracticasSeleccionadas(practicasSeleccionadas.map((p) =>
      p.practicaId === practicaId
        ? { ...p, cantidad, subtotal: cantidad * p.precioUnitario }
        : p
    ));
  }

  function actualizarPrecio(practicaId: string, precio: number) {
    setPracticasSeleccionadas(practicasSeleccionadas.map((p) =>
      p.practicaId === practicaId
        ? { ...p, precioUnitario: precio, subtotal: p.cantidad * precio }
        : p
    ));
  }

  function quitarPractica(practicaId: string) {
    setPracticasSeleccionadas(practicasSeleccionadas.filter((p) => p.practicaId !== practicaId));
  }

  async function handleGuardar() {
    setErrorMsg(null);
    if (!nombre.trim()) { setErrorMsg('El nombre es obligatorio'); return; }

    setGuardando(true);
    try {
      const payload = { nombre: nombre.trim(), descripcion: descripcion.trim(), practicas: practicasSeleccionadas, precioTotal, activo };
      await pedirApi(modo === 'crear' ? '/api/tratamientos' : `/api/tratamientos/${inicial!.id}`, {
        metodo: modo === 'crear' ? 'POST' : 'PATCH',
        cuerpo: payload,
        mensajeError: 'Error al guardar',
      });
      router.push('/tratamientos');
      router.refresh();
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900 }}>
      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <Card>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--ink)' }}>
            Información del tratamiento
          </Typography>
          <TextField
            label="Nombre del tratamiento *"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
          />
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Describe brevemente el tratamiento…"
          />
          <FormControlLabel
            control={<Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} />}
            label="Tratamiento activo"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--ink)', mb: 2 }}>
            Prácticas incluidas
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
            <Autocomplete
              options={practicas.filter((p) => p.activa)}
              getOptionLabel={(p) => `${p.nombre}${p.categoria ? ` — ${p.categoria}` : ''}`}
              value={practicaAgregar}
              onChange={(_e, val) => setPracticaAgregar(val)}
              renderInput={(params) => <TextField {...params} label="Buscar práctica para agregar…" />}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={agregarPractica}
              disabled={!practicaAgregar}
              sx={{ height: 56, flexShrink: 0 }}
            >
              Agregar
            </Button>
          </Box>

          {practicasSeleccionadas.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center', color: 'var(--soft)', backgroundColor: 'var(--bg)', borderRadius: 2 }}>
              <Typography variant="body2">Aún no se agregaron prácticas a este tratamiento</Typography>
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Práctica</TableCell>
                    <TableCell align="center" sx={{ width: 100 }}>Cantidad</TableCell>
                    <TableCell align="right" sx={{ width: 140 }}>Precio unit.</TableCell>
                    <TableCell align="right" sx={{ width: 120 }}>Subtotal</TableCell>
                    <TableCell align="center" sx={{ width: 60 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {practicasSeleccionadas.map((p) => (
                    <TableRow key={p.practicaId}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.practicaNombre}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={p.cantidad}
                          onChange={(e) => actualizarCantidad(p.practicaId, parseInt(e.target.value) || 1)}
                          size="small"
                          sx={{ width: 80 }}
                          slotProps={{ htmlInput: { min: 1, style: { textAlign: 'center' } } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={p.precioUnitario}
                          onChange={(e) => actualizarPrecio(p.practicaId, parseFloat(e.target.value) || 0)}
                          size="small"
                          sx={{ width: 120 }}
                          slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatPrecio(p.subtotal)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Quitar">
                          <IconButton size="small" sx={{ color: 'var(--bad)' }} onClick={() => quitarPractica(p.practicaId)}>
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 2, borderTop: '1px solid var(--line)' }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: 'var(--soft)' }}>PRECIO TOTAL DEL TRATAMIENTO</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--ink)' }}>
                    {formatPrecio(precioTotal)}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.push('/tratamientos')} disabled={guardando}>
          Cancelar
        </Button>
        <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={handleGuardar} loading={guardando}>
          {modo === 'crear' ? 'Guardar tratamiento' : 'Guardar cambios'}
        </Button>
      </Box>
    </Box>
  );
}
