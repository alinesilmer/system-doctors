'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import PageContainer from '@/components/ui/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConfirmarDialogo from '@/components/ui/ConfirmarDialogo';
import Buscador from '@/components/ui/Buscador';
import Etiqueta from '@/components/ui/Etiqueta';
import Pildora from '@/components/ui/Pildora';
import Tubo, { nivelDe } from '@/components/stock/Tubo';
import TabAlertas from '@/components/stock/TabAlertas';
import TabMovimientos from '@/components/stock/TabMovimientos';
import TabFacturaDemo from '@/components/stock/TabFacturaDemo';
import TabProcedimiento from '@/components/stock/TabProcedimiento';
import { pedirApi } from '@/lib/api/cliente';
import { useStock } from '@/hooks/useStock';
import { useEliminar } from '@/hooks/useEliminar';
import type { ItemStock, TipoMovimientoStock } from '@/lib/types';

const TABS = [
  { label: 'Stock', icon: <ScienceRoundedIcon /> },
  { label: 'Vencen', icon: <EventBusyRoundedIcon /> },
  { label: 'Historial', icon: <HistoryRoundedIcon /> },
  { label: 'Factura', icon: <ReceiptLongRoundedIcon /> },
  { label: 'Procedimiento', icon: <MedicalServicesRoundedIcon /> },
];

const MOVIMIENTO_VACIO = { tipo: 'entrada' as TipoMovimientoStock, cantidad: 1, motivo: '' };

export default function StockPage() {
  const router = useRouter();
  const { items, cargando, error, recargar } = useStock();
  const [tab, setTab] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState<ItemStock | null>(null);
  const [movimiento, setMovimiento] = useState(MOVIMIENTO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorMov, setErrorMov] = useState<string | null>(null);
  const [ajustando, setAjustando] = useState<string | null>(null);
  const eliminacion = useEliminar<{ id: string; nombre: string }>((o) => `/api/stock/${o.id}`, recargar);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    // Lo que falta va primero: es lo que hay que mirar.
    const orden = { agotado: 0, bajo: 1, bien: 2 };
    return items
      .filter((i) => !q || i.nombre.toLowerCase().includes(q) || i.categoria.toLowerCase().includes(q) || i.codigoInterno?.toLowerCase().includes(q))
      .sort((a, b) => orden[nivelDe(a)] - orden[nivelDe(b)] || a.nombre.localeCompare(b.nombre));
  }, [items, busqueda]);

  const faltan = items.filter((i) => nivelDe(i) !== 'bien').length;

  async function registrar(item: ItemStock, datos: typeof MOVIMIENTO_VACIO) {
    await pedirApi(`/api/stock/${item.id}/movimiento`, {
      metodo: 'POST',
      cuerpo: datos,
      mensajeError: 'No se pudo registrar el movimiento',
    });
    await recargar();
  }

  /** Los botones + y − del tubo: un movimiento de una unidad. */
  async function ajustar(item: ItemStock, delta: 1 | -1) {
    setAjustando(item.id);
    setErrorMov(null);
    try {
      await registrar(item, { tipo: delta > 0 ? 'entrada' : 'salida', cantidad: 1, motivo: 'Ajuste rápido' });
    } catch (e) {
      setErrorMov((e as Error).message);
    } finally {
      setAjustando(null);
    }
  }

  async function guardarMovimiento() {
    if (!abierto) return;
    setGuardando(true);
    setErrorMov(null);
    try {
      await registrar(abierto, movimiento);
      cerrar();
    } catch (e) {
      // P. ej. una salida mayor al stock disponible: el diálogo queda abierto con el motivo.
      setErrorMov((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  function cerrar() {
    setAbierto(null);
    setMovimiento(MOVIMIENTO_VACIO);
    setErrorMov(null);
  }

  return (
    <PageContainer titulo="Stock" acciones={<Pildora href="/stock/nuevo">Insumo</Pildora>}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {errorMov && !abierto && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMov(null)}>{errorMov}</Alert>}

      <Tabs className="in" style={{ '--n': 1 } as React.CSSProperties} value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {TABS.map((t) => <Tab key={t.label} icon={t.icon} iconPosition="start" label={t.label} />)}
      </Tabs>

      {tab === 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 16rem', maxWidth: '34rem' }}>
              <Buscador valor={busqueda} onCambio={setBusqueda} ayuda="Buscar insumo" />
            </Box>
            {faltan > 0
              ? <Etiqueta tono="acento">{faltan === 1 ? 'Falta 1' : `Faltan ${faltan}`}</Etiqueta>
              : items.length > 0 && <Etiqueta tono="ok">Todo bien</Etiqueta>}
          </Box>

          {cargando ? (
            <LoadingScreen />
          ) : items.length === 0 ? (
            <EmptyState
              titulo="Estante vacío"
              descripcion="Cargá el primer insumo."
              icono={<ScienceRoundedIcon fontSize="inherit" />}
              accion={{ label: 'Insumo', onClick: () => router.push('/stock/nuevo') }}
            />
          ) : filtrados.length === 0 ? (
            <EmptyState titulo="Nada con ese nombre" icono={<SearchOffRoundedIcon fontSize="inherit" />} />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))', gap: 2, mt: 3 }}>
              {filtrados.map((item, i) => (
                <Tubo key={item.id} item={item} orden={i} ocupado={ajustando === item.id} onAjustar={ajustar} onAbrir={setAbierto} />
              ))}
            </Box>
          )}
        </>
      )}

      {tab === 1 && <TabAlertas items={items} />}
      {tab === 2 && <TabMovimientos />}
      {tab === 3 && <TabFacturaDemo onIngreso={recargar} />}
      {tab === 4 && <TabProcedimiento items={items} onEjecucion={recargar} />}

      {/* Detalle de un insumo: movimiento con cantidad y motivo, editar, eliminar. */}
      <Dialog open={!!abierto} onClose={cerrar} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>{abierto?.nombre}</Box>
          <Tooltip title="Editar">
            <IconButton component={Link} href={`/stock/${abierto?.id}/editar`} aria-label="Editar"><EditRoundedIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              aria-label="Eliminar"
              onClick={() => { if (abierto) { eliminacion.pedir({ id: abierto.id, nombre: abierto.nombre }); cerrar(); } }}
            >
              <DeleteRoundedIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Etiqueta>{abierto?.cantidad} {abierto?.unidad}</Etiqueta>
            <Etiqueta>Mínimo {abierto?.cantidadMinima}</Etiqueta>
            {abierto?.ubicacion && <Etiqueta tono="lila">{abierto.ubicacion}</Etiqueta>}
          </Box>
          <TextField
            label="Movimiento"
            select
            value={movimiento.tipo}
            onChange={(e) => setMovimiento((p) => ({ ...p, tipo: e.target.value as TipoMovimientoStock }))}
            fullWidth
          >
            <MenuItem value="entrada">Entra</MenuItem>
            <MenuItem value="salida">Sale</MenuItem>
            <MenuItem value="ajuste">Quedan exactamente</MenuItem>
          </TextField>
          <TextField
            label="Cantidad"
            type="number"
            value={movimiento.cantidad}
            onChange={(e) => setMovimiento((p) => ({ ...p, cantidad: parseInt(e.target.value) || 0 }))}
            fullWidth
            slotProps={{ htmlInput: { min: 0 } }}
          />
          <TextField
            label="Motivo"
            value={movimiento.motivo}
            onChange={(e) => setMovimiento((p) => ({ ...p, motivo: e.target.value }))}
            fullWidth
            placeholder="Compra, uso, vencimiento…"
          />
          {errorMov && <Alert severity="error">{errorMov}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={cerrar} disabled={guardando}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={guardarMovimiento}
            disabled={guardando || (movimiento.tipo !== 'ajuste' && movimiento.cantidad <= 0)}
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmarDialogo
        abierto={!!eliminacion.objetivo}
        titulo="Eliminar insumo"
        descripcion={`¿Eliminar "${eliminacion.objetivo?.nombre}"? No se puede deshacer.`}
        textoConfirmar="Eliminar"
        cargando={eliminacion.eliminando}
        error={eliminacion.error}
        onConfirmar={eliminacion.confirmar}
        onCancelar={eliminacion.cancelar}
      />
    </PageContainer>
  );
}
