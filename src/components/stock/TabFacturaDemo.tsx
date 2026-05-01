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
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import type { ItemStock } from '@/lib/types';

interface ProductoFactura {
  nombre: string;
  cantidad: number;
  unidad: string;
  categoria: string;
  lote: string;
}

const FACTURAS_DEMO = [
  {
    id: 'FAC-2025-001',
    proveedor: 'Distribuidora Médica SA',
    fecha: '2025-04-15',
    productos: [
      { nombre: 'Guantes de látex talla M', cantidad: 100, unidad: 'unidades', categoria: 'Insumos', lote: 'GL-2025-04' },
      { nombre: 'Jeringas 10ml', cantidad: 50, unidad: 'unidades', categoria: 'Insumos', lote: 'JR-2025-04' },
      { nombre: 'Alcohol 96°', cantidad: 10, unidad: 'litros', categoria: 'Medicamentos', lote: 'ALC-04-25' },
    ] as ProductoFactura[],
  },
  {
    id: 'FAC-2025-002',
    proveedor: 'FarmaSupplies Ltda.',
    fecha: '2025-04-20',
    productos: [
      { nombre: 'Ibuprofeno 400mg', cantidad: 200, unidad: 'comprimidos', categoria: 'Medicamentos', lote: 'IBU-Q2-25' },
      { nombre: 'Paracetamol 500mg', cantidad: 150, unidad: 'comprimidos', categoria: 'Medicamentos', lote: 'PAR-Q2-25' },
      { nombre: 'Vendas elásticas 10cm', cantidad: 30, unidad: 'unidades', categoria: 'Insumos', lote: 'VEN-25-04' },
    ] as ProductoFactura[],
  },
];

interface Props { onIngreso: () => void }

export default function TabFacturaDemo({ onIngreso }: Props) {
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<typeof FACTURAS_DEMO[0] | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [exito, setExito] = useState(false);
  const [proveedorLibre, setProveedorLibre] = useState('');

  async function simularIngreso() {
    if (!facturaSeleccionada) return;
    setSimulando(true);
    try {
      for (const prod of facturaSeleccionada.productos) {
        await fetch('/api/stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: prod.nombre,
            categoria: prod.categoria,
            cantidad: prod.cantidad,
            cantidadMinima: Math.floor(prod.cantidad * 0.1),
            unidad: prod.unidad,
            proveedor: facturaSeleccionada.proveedor,
            lote: prod.lote,
            ubicacion: 'Depósito',
          }),
        });
      }
      setExito(true);
      setFacturaSeleccionada(null);
      onIngreso();
    } finally {
      setSimulando(false);
    }
  }

  if (exito) {
    return (
      <Alert
        icon={<CheckCircleOutlineIcon />}
        severity="success"
        action={<Button size="small" onClick={() => setExito(false)}>Simular otra</Button>}
      >
        Ingreso simulado correctamente — los items fueron agregados al inventario.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <strong>Modo demo</strong> — Simulá el ingreso de productos desde una factura de proveedor. En producción esto conectaría con el sistema de facturación electrónica.
      </Alert>

      {/* Selector de factura */}
      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongOutlinedIcon sx={{ color: '#6366F1', fontSize: 18 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>Facturas disponibles</Typography>
        </Box>
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {FACTURAS_DEMO.map((f) => (
            <Box
              key={f.id}
              onClick={() => { setFacturaSeleccionada(f === facturaSeleccionada ? null : f); setExito(false); }}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '2px solid',
                borderColor: facturaSeleccionada?.id === f.id ? '#6366F1' : '#E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.15s',
                backgroundColor: facturaSeleccionada?.id === f.id ? '#F5F3FF' : 'transparent',
                '&:hover': { borderColor: '#A5B4FC', backgroundColor: '#FAFAFA' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{f.id}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>{f.proveedor} · {new Date(f.fecha + 'T00:00:00').toLocaleDateString('es-AR')}</Typography>
                </Box>
                <Chip label={`${f.productos.length} items`} size="small" sx={{ backgroundColor: '#EDE9FE', color: '#5B21B6', fontWeight: 600 }} />
              </Box>
            </Box>
          ))}

          <Divider sx={{ my: 0.5 }}><Typography variant="caption" sx={{ color: '#94A3B8' }}>o ingresá un proveedor manual</Typography></Divider>
          <TextField
            label="Proveedor (factura manual)"
            value={proveedorLibre}
            onChange={(e) => setProveedorLibre(e.target.value)}
            placeholder="Nombre del proveedor"
            size="small"
            fullWidth
            disabled
            helperText="Disponible en versión completa"
          />
        </Box>
      </Card>

      {/* Preview de productos */}
      {facturaSeleccionada && (
        <Card sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E2E8F0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
              Productos — {facturaSeleccionada.id}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>{facturaSeleccionada.proveedor}</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Categoría</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Cantidad</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Lote</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facturaSeleccionada.productos.map((p, i) => (
                  <TableRow key={i} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{p.nombre}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={p.categoria} size="small" sx={{ backgroundColor: '#F1F5F9', color: '#475569' }} />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.cantidad} {p.unidad}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#64748B' }}>{p.lote}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2.5, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={simularIngreso}
              disabled={simulando}
              startIcon={<ReceiptLongOutlinedIcon />}
              sx={{ backgroundColor: '#6366F1', '&:hover': { backgroundColor: '#4F46E5' } }}
            >
              {simulando ? 'Procesando...' : 'Simular ingreso al inventario'}
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
}
