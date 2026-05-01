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
    try {
      for (const ins of insumos) {
        if (!ins.itemId || ins.cantidad <= 0) continue;
        await fetch(`/api/stock/${ins.itemId}/movimiento`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'salida',
            cantidad: ins.cantidad,
            motivo: `Procedimiento: ${procSeleccionado.nombre}${motivo ? ` — ${motivo}` : ''}`,
          }),
        });
      }
      setExito(true);
      setProcSeleccionado(null);
      setInsumos([]);
      setMotivo('');
      onEjecucion();
    } finally {
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
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <strong>Modo demo</strong> — Seleccioná un procedimiento para descontar automáticamente los insumos del inventario.
      </Alert>

      {/* Selector de procedimiento */}
      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
          <MedicalServicesOutlinedIcon sx={{ color: '#10B981', fontSize: 18 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>Procedimientos disponibles</Typography>
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
                borderColor: procSeleccionado?.id === proc.id ? '#10B981' : '#E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.15s',
                backgroundColor: procSeleccionado?.id === proc.id ? '#F0FDF4' : 'transparent',
                '&:hover': { borderColor: '#6EE7B7', backgroundColor: '#FAFAFA' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{proc.nombre}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>{proc.descripcion}</Typography>
                </Box>
                <Chip label={`${proc.insumos.length} insumos`} size="small" sx={{ backgroundColor: '#D1FAE5', color: '#065F46', fontWeight: 600 }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Insumos del procedimiento */}
      {procSeleccionado && (
        <Card sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E2E8F0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>Insumos — {procSeleccionado.nombre}</Typography>
          </Box>

          {insuficientes.length > 0 && (
            <Alert severity="warning" sx={{ m: 2, mb: 0 }}>
              Stock insuficiente para: {insuficientes.map((i) => i.nombre).join(', ')}
            </Alert>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Insumo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Disponible</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>A descontar</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {insumos.map((ins, i) => {
                  const ok = !ins.itemId || ins.cantidad <= ins.disponible;
                  return (
                    <TableRow key={i} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{ins.nombre}</Typography>
                        {!ins.itemId && <Typography variant="caption" sx={{ color: '#EF4444' }}>No encontrado en inventario</Typography>}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ color: '#64748B' }}>{ins.disponible} {ins.unidad}</Typography>
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
                          ? <Chip label="Sin mapear" size="small" sx={{ backgroundColor: '#F1F5F9', color: '#94A3B8' }} />
                          : ok
                          ? <Chip label="OK" size="small" sx={{ backgroundColor: '#D1FAE5', color: '#065F46', fontWeight: 700 }} />
                          : <Chip label="Insuficiente" size="small" sx={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 700 }} />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ p: 2.5, borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                sx={{ backgroundColor: '#10B981', '&:hover': { backgroundColor: '#059669' } }}
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
