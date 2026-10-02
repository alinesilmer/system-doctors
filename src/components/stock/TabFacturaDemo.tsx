'use client';

import { pedirApi } from '@/lib/api/cliente';
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
  const [error, setError] = useState<string | null>(null);
  const [proveedorLibre, setProveedorLibre] = useState('');

  async function simularIngreso() {
    if (!facturaSeleccionada) return;
    setSimulando(true);
    setError(null);
    try {
      // En paralelo: son altas independientes entre sí.
      await Promise.all(facturaSeleccionada.productos.map((prod) =>
        pedirApi('/api/stock', {
          metodo: 'POST',
          cuerpo: {
            nombre: prod.nombre,
            categoria: prod.categoria,
            cantidad: prod.cantidad,
            cantidadMinima: Math.floor(prod.cantidad * 0.1),
            unidad: prod.unidad,
            proveedor: facturaSeleccionada.proveedor,
            lote: prod.lote,
            ubicacion: 'Depósito',
          },
        })));
      setExito(true);
      setFacturaSeleccionada(null);
    } catch (e) {
      setError(`No se pudieron ingresar todos los productos: ${(e as Error).message}`);
    } finally {
      // Aun con un fallo parcial, el inventario pudo cambiar.
      onIngreso();
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
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <strong>Modo demo</strong> — Simulá el ingreso de productos desde una factura de proveedor. En producción esto conectaría con el sistema de facturación electrónica.
      </Alert>

      {/* Selector de factura */}
      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongOutlinedIcon sx={{ color: 'var(--pink)', fontSize: 18 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--ink)' }}>Facturas disponibles</Typography>
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
                borderColor: facturaSeleccionada?.id === f.id ? 'var(--pink)' : 'var(--line)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                backgroundColor: facturaSeleccionada?.id === f.id ? 'var(--lila)' : 'transparent',
                '&:hover': { borderColor: 'var(--lila)', backgroundColor: 'var(--bg)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--ink)' }}>{f.id}</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--soft)' }}>{f.proveedor} · {new Date(f.fecha + 'T00:00:00').toLocaleDateString('es-AR')}</Typography>
                </Box>
                <Chip label={`${f.productos.length} items`} size="small" sx={{ backgroundColor: 'var(--lila)', color: 'var(--ink)', fontWeight: 600 }} />
              </Box>
            </Box>
          ))}

          <Divider sx={{ my: 0.5 }}><Typography variant="caption" sx={{ color: 'var(--soft)' }}>o ingresá un proveedor manual</Typography></Divider>
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
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid var(--line)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--ink)' }}>
              Productos — {facturaSeleccionada.id}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--soft)' }}>{facturaSeleccionada.proveedor}</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--bg)' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'var(--soft)' }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'var(--soft)' }}>Categoría</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--soft)' }}>Cantidad</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'var(--soft)' }}>Lote</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facturaSeleccionada.productos.map((p, i) => (
                  <TableRow key={i} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>{p.nombre}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={p.categoria} size="small" sx={{ backgroundColor: 'var(--bg)', color: 'var(--soft)' }} />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.cantidad} {p.unidad}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'var(--soft)' }}>{p.lote}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2.5, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={simularIngreso}
              disabled={simulando}
              startIcon={<ReceiptLongOutlinedIcon />}
              sx={{ backgroundColor: 'var(--pink)', '&:hover': { backgroundColor: 'var(--pink)' } }}
            >
              {simulando ? 'Procesando...' : 'Simular ingreso al inventario'}
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
}
