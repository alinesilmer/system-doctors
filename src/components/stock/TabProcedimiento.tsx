'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { pedirApi } from '@/lib/api/cliente';
import type { ItemStock } from '@/lib/types';

interface InsumoUso {
  itemId: string;
  nombre: string;
  cantidad: number;
  disponible: number;
  unidad: string;
}

const PROCEDIMIENTOS_DEMO = [
  {
    id: 'PROC-001',
    nombre: 'Curación simple',
    descripcion: 'Limpieza y vendaje de herida menor',
    insumos: ['Guantes de látex talla M', 'Vendas elásticas 10cm', 'Alcohol 96°'],
    cantidades: [2, 1, 0.1],
  },
  {
    id: 'PROC-002',
    nombre: 'Extracción de sangre',
    descripcion: 'Extracción para análisis de laboratorio',
    insumos: ['Guantes de látex talla M', 'Jeringas 10ml'],
    cantidades: [1, 2],
  },
  {
    id: 'PROC-003',
    nombre: 'Control de signos vitales',
    descripcion: 'Medición de presión, pulso y temperatura',
    insumos: ['Guantes de látex talla M'],
    cantidades: [1],
  },
];

interface Props { items: ItemStock[]; onEjecucion: () => void }

export default function TabProcedimiento({ items, onEjecucion }: Props) {
  const [procSeleccionado, setProcSeleccionado] = useState<typeof PROCEDIMIENTOS_DEMO[0] | null>(null);
  const [insumos, setInsumos] = useState<InsumoUso[]>([]);
  const [ejecutando, setEjecutando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');

  function seleccionarProc(proc: typeof PROCEDIMIENTOS_DEMO[0]) {
    setProcSeleccionado(proc);
    setExito(false);
    const ins: InsumoUso[] = proc.insumos.map((nombre, i) => {
      const item = items.find((it) => it.nombre.toLowerCase().includes(nombre.toLowerCase()));
      return {
        itemId: item?.id ?? '',
        nombre,
        cantidad: proc.cantidades[i],
        disponible: item?.cantidad ?? 0,
        unidad: item?.unidad ?? 'unidades',
      };
    });
    setInsumos(ins);
  }

  function ajustarCantidad(idx: number, delta: number) {
    setInsumos((prev) => prev.map((ins, i) => i === idx ? { ...ins, cantidad: Math.max(0, ins.cantidad + delta) } : ins));
  }

  const insuficientes = insumos.filter((ins) => ins.itemId && ins.cantidad > ins.disponible);

  async function ejecutarProcedimiento() {
    if (!procSeleccionado) return;
    setEjecutando(true);
    setError(null);
    try {
      // De a uno: si un insumo no alcanza, se corta ahí y se informa cuál fue.
      for (const ins of insumos) {
        if (!ins.itemId || ins.cantidad <= 0) continue;
        try {
          await pedirApi(`/api/stock/${ins.itemId}/movimiento`, {
            metodo: 'POST',
            cuerpo: {
              tipo: 'salida',
              cantidad: ins.cantidad,
              motivo: `Procedimiento: ${procSeleccionado.nombre}${motivo ? ` — ${motivo}` : ''}`,
            },
          });
        } catch (e) {
          throw new Error(`${ins.nombre}: ${(e as Error).message}`);
        }
      }
      setExito(true);
      setProcSeleccionado(null);
      setInsumos([]);
      setMotivo('');
    } catch (e) {
      setError(`No se completó el procedimiento. ${(e as Error).message}`);
    } finally {
      // Los insumos anteriores al fallo ya se descontaron: hay que refrescar igual.
      onEjecucion();
      setEjecutando(false);
    }
  }

  if (exito) {
    return (
      <Alert
        icon={<CheckCircleOutlineIcon />}
        severity="success"
        action={<Button size="small" onClick={() => setExito(false)}>Ejecutar otro</Button>}
      >
        Procedimiento ejecutado — los insumos fueron descontados del inventario.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <strong>Modo demo</strong> — Seleccioná un procedimiento para descontar automáticamente los insumos del inventario.
      </Alert>

      {/* Selector de procedimiento */}
      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 1 }}>
          <MedicalServicesOutlinedIcon sx={{ color: 'var(--ok)', fontSize: 18 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--ink)' }}>Procedimientos disponibles</Typography>
        </Box>
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {PROCEDIMIENTOS_DEMO.map((proc) => (
            <Box
              key={proc.id}
              onClick={() => seleccionarProc(proc)}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '2px solid',
                borderColor: procSeleccionado?.id === proc.id ? 'var(--ok)' : 'var(--line)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                backgroundColor: procSeleccionado?.id === proc.id ? 'color-mix(in srgb, var(--ok) 18%, transparent)' : 'transparent',
                '&:hover': { borderColor: 'color-mix(in srgb, var(--ok) 18%, transparent)', backgroundColor: 'var(--bg)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--ink)' }}>{proc.nombre}</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--soft)' }}>{proc.descripcion}</Typography>
                </Box>
                <Chip label={`${proc.insumos.length} insumos`} size="small" sx={{ backgroundColor: 'color-mix(in srgb, var(--ok) 18%, transparent)', color: 'var(--ok)', fontWeight: 600 }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Insumos del procedimiento */}
      {procSeleccionado && (
        <Card sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid var(--line)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--ink)' }}>Insumos — {procSeleccionado.nombre}</Typography>
          </Box>

          {insuficientes.length > 0 && (
            <Alert severity="warning" sx={{ m: 2, mb: 0 }}>
              Stock insuficiente para: {insuficientes.map((i) => i.nombre).join(', ')}
            </Alert>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--bg)' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'var(--soft)' }}>Insumo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--soft)' }}>Disponible</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--soft)' }}>A descontar</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'var(--soft)' }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {insumos.map((ins, i) => {
                  const ok = !ins.itemId || ins.cantidad <= ins.disponible;
                  return (
                    <TableRow key={i} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>{ins.nombre}</Typography>
                        {!ins.itemId && <Typography variant="caption" sx={{ color: 'var(--bad)' }}>No encontrado en inventario</Typography>}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ color: 'var(--soft)' }}>{ins.disponible} {ins.unidad}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => ajustarCantidad(i, -1)} disabled={ins.cantidad <= 0}>
                            <RemoveIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                          <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{ins.cantidad}</Typography>
                          <IconButton size="small" onClick={() => ajustarCantidad(i, 1)}>
                            <AddIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {!ins.itemId
                          ? <Chip label="Sin mapear" size="small" sx={{ backgroundColor: 'var(--bg)', color: 'var(--soft)' }} />
                          : ok
                          ? <Chip label="OK" size="small" sx={{ backgroundColor: 'color-mix(in srgb, var(--ok) 18%, transparent)', color: 'var(--ok)', fontWeight: 700 }} />
                          : <Chip label="Insuficiente" size="small" sx={{ backgroundColor: 'color-mix(in srgb, var(--bad) 16%, transparent)', color: 'var(--bad)', fontWeight: 700 }} />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ p: 2.5, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Paciente / Nota (opcional)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              size="small"
              placeholder="Ej: Juan Pérez — consulta de rutina"
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={ejecutarProcedimiento}
                disabled={ejecutando || insuficientes.length > 0}
                startIcon={<MedicalServicesOutlinedIcon />}
                sx={{ backgroundColor: 'var(--ok)', '&:hover': { backgroundColor: 'var(--ok)' } }}
              >
                {ejecutando ? 'Ejecutando...' : 'Ejecutar y descontar stock'}
              </Button>
            </Box>
          </Box>
        </Card>
      )}
    </Box>
  );
}
