'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { pedirApi } from '@/lib/api/cliente';
import PageContainer from '@/components/ui/PageContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import type { FormularioInvitacion } from '@/lib/types';
import { useColeccion } from '@/hooks/useRecurso';

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const ESTADO_CONFIG = {
  pendiente:  { label: 'Esperando al paciente', color: 'var(--warn)', bg: 'var(--sun)' },
  completado: { label: 'Datos recibidos',        color: 'var(--ink)', bg: 'var(--lila)' },
  aprobado:   { label: 'Paciente creado',         color: 'var(--ok)', bg: 'color-mix(in srgb, var(--ok) 18%, transparent)' },
};

export default function InvitacionesPage() {
  const router = useRouter();
  const {
    items: invitaciones, cargando, error: errorCarga, recargar: cargar,
  } = useColeccion<FormularioInvitacion>('/api/invitaciones', 'Error al cargar invitaciones');
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const error = errorAccion ?? errorCarga;
  const [generando, setGenerando] = useState(false);
  const [linkDialogo, setLinkDialogo] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [aprobando, setAprobando] = useState<string | null>(null);
  const [detalleDialogo, setDetalleDialogo] = useState<FormularioInvitacion | null>(null);

  async function generarLink() {
    setGenerando(true);
    try {
      const data = await pedirApi<{ data: { token: string } }>('/api/invitaciones', { metodo: 'POST' });
      const url = `${window.location.origin}/registro-paciente/${data.data.token}`;
      setLinkDialogo(url);
      cargar();
    } catch (e) {
      setErrorAccion((e as Error).message);
    } finally {
      setGenerando(false);
    }
  }

  async function aprobar(inv: FormularioInvitacion) {
    setAprobando(inv.id);
    try {
      const data = await pedirApi<{ data?: { pacienteId?: string } }>(`/api/invitaciones/${inv.token}`, { metodo: 'PUT' });
      cargar();
      setDetalleDialogo(null);
      if (data.data?.pacienteId) router.push(`/pacientes/${data.data.pacienteId}`);
    } catch (e) {
      setErrorAccion((e as Error).message);
    } finally {
      setAprobando(null);
    }
  }

  function copiarLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const acciones = (
    <Button variant="contained" startIcon={<AddIcon />} onClick={generarLink} disabled={generando}>
      {generando ? 'Generando...' : 'Generar enlace'}
    </Button>
  );

  return (
    <PageContainer volver="/mas" titulo="Invitaciones" acciones={acciones}>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorAccion(null)}>{error}</Alert>}

      <Alert severity="info" sx={{ mb: 2 }}>
        Generá un enlace único y enviáselo al paciente por <strong>WhatsApp, email o SMS</strong>. El paciente completa el formulario desde su celular y vos aprobás sus datos acá.
      </Alert>

      <Card sx={{ overflow: 'hidden' }}>
        {cargando ? <LoadingScreen mensaje="Cargando invitaciones..." /> : invitaciones.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <PersonAddOutlinedIcon sx={{ fontSize: 48, color: 'var(--line)', mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'var(--soft)' }}>
              No hay invitaciones aún. Generá el primero enlace para comenzar.
            </Typography>
          </Box>
        ) : (
          <Box>
            {invitaciones.map((inv) => {
              const cfg = ESTADO_CONFIG[inv.estado];
              const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/registro-paciente/${inv.token}`;
              return (
                <Box key={inv.id} sx={{ px: 3, py: 2, borderBottom: '1px solid var(--bg)', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.7rem' }} />
                      <Typography variant="caption" sx={{ color: 'var(--soft)' }}>
                        {formatFecha(inv.creadoEn)}
                      </Typography>
                    </Box>
                    {inv.datosPaciente && (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>
                        {inv.datosPaciente.apellido}, {inv.datosPaciente.nombre} — DNI {inv.datosPaciente.dni}
                      </Typography>
                    )}
                    {inv.estado === 'pendiente' && (
                      <Typography variant="caption" sx={{ color: 'var(--soft)', wordBreak: 'break-all', display: 'block', mt: 0.25 }}>
                        {url}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                    {inv.estado === 'pendiente' && (
                      <Tooltip title={copiado ? '¡Copiado!' : 'Copiar enlace'}>
                        <IconButton size="small" onClick={() => copiarLink(url)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {inv.estado === 'completado' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => setDetalleDialogo(inv)}
                        sx={{ backgroundColor: 'var(--ink)', '&:hover': { backgroundColor: 'var(--ink)' } }}
                      >
                        Revisar y aprobar
                      </Button>
                    )}
                    {inv.estado === 'aprobado' && (
                      <Typography variant="caption" sx={{ color: 'var(--ok)', fontWeight: 600 }}>✓ Creado</Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Card>

      {/* Link generado dialog */}
      <Dialog open={!!linkDialogo} onClose={() => setLinkDialogo(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Enlace generado</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Alert severity="success">Enlace listo. Copialo y enviáselo al paciente.</Alert>
          <TextField value={linkDialogo ?? ''} fullWidth size="small" slotProps={{ input: { readOnly: true } }} />
          <Typography variant="caption" sx={{ color: 'var(--soft)' }}>
            El paciente puede abrirlo desde cualquier dispositivo, completar el formulario y los datos aparecerán acá para que los apruebes.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setLinkDialogo(null)}>Cerrar</Button>
          <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={() => linkDialogo && copiarLink(linkDialogo)}>
            {copiado ? '¡Copiado!' : 'Copiar enlace'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detalle / aprobación dialog */}
      <Dialog open={!!detalleDialogo} onClose={() => setDetalleDialogo(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Datos del paciente</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {detalleDialogo?.datosPaciente && (() => {
            const d = detalleDialogo.datosPaciente!;
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {([
                  ['Nombre', `${d.nombre} ${d.apellido}`],
                  ['DNI', d.dni],
                  ['Fecha de nacimiento', d.fechaNacimiento],
                  ['Sexo', d.sexo],
                  ['Teléfono', d.telefono],
                  ['Email', d.email],
                  ['Dirección', d.direccion],
                  ['Obra social', d.obraSocial],
                  ['Nro. afiliado', d.nroAfiliado],
                  ['Grupo sanguíneo', d.grupoSanguineo],
                  ['Alergias', d.alergias],
                  ['Notas', d.notas],
                ] as [string, string | undefined][]).filter(([, v]) => v).map(([label, value]) => (
                  <Box key={label}>
                    <Typography variant="caption" sx={{ color: 'var(--soft)', textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 700 }}>{label}</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--ink)' }}>{value}</Typography>
                    <Divider sx={{ mt: 1, borderColor: 'var(--bg)' }} />
                  </Box>
                ))}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDetalleDialogo(null)}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<CheckCircleOutlineIcon />}
            disabled={aprobando === detalleDialogo?.id}
            onClick={() => detalleDialogo && aprobar(detalleDialogo)}
          >
            {aprobando === detalleDialogo?.id ? 'Creando...' : 'Aprobar y crear paciente'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
