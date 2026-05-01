'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import SendIcon from '@mui/icons-material/Send';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PageContainer from '@/components/ui/PageContainer';
import type { ConversacionWA, MensajeWA } from '@/lib/types';

const CLASIFICACION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  urgencia:       { label: '🚨 Urgencia',        color: '#991B1B', bg: '#FEE2E2' },
  consulta_medica:{ label: '🩺 Consulta médica', color: '#1E40AF', bg: '#DBEAFE' },
  receta:         { label: '💊 Receta',           color: '#5B21B6', bg: '#EDE9FE' },
  turno:          { label: '📅 Turno',            color: '#065F46', bg: '#D1FAE5' },
  confirmacion:   { label: '✅ Confirmación',     color: '#065F46', bg: '#D1FAE5' },
  informacion:    { label: 'ℹ️ Información',      color: '#374151', bg: '#F3F4F6' },
  secretaria:     { label: '📋 Secretaría',       color: '#92400E', bg: '#FEF3C7' },
  otro:           { label: '💬 Otro',             color: '#475569', bg: '#F1F5F9' },
};

const DERIVACION_CONFIG: Record<string, { label: string; color: string }> = {
  medico:     { label: 'Requiere médico',    color: '#DC2626' },
  secretaria: { label: 'Para secretaría',   color: '#D97706' },
  automatico: { label: 'Respondido auto',   color: '#059669' },
};

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function formatFechaCorta(iso: string) {
  const d = new Date(iso);
  const hoy = new Date();
  const diff = Math.floor((hoy.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

export default function MensajesPage() {
  const [conversaciones, setConversaciones] = useState<ConversacionWA[]>([]);
  const [seleccionada, setSeleccionada] = useState<ConversacionWA | null>(null);
  const [mensajes, setMensajes] = useState<MensajeWA[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordatorioDialogo, setRecordatorioDialogo] = useState(false);
  const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false);
  const [resultadoRecordatorio, setResultadoRecordatorio] = useState<Record<string, unknown> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cargarConversaciones = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/conversaciones');
      const data = await res.json();
      setConversaciones(data.items ?? []);
    } catch { /* silent */ }
    finally { setCargando(false); }
  }, []);

  useEffect(() => {
    cargarConversaciones();
    const interval = setInterval(cargarConversaciones, 10000);
    return () => clearInterval(interval);
  }, [cargarConversaciones]);

  const cargarMensajes = useCallback(async (conv: ConversacionWA) => {
    setCargandoMensajes(true);
    try {
      const res = await fetch(`/api/whatsapp/conversaciones?telefono=${encodeURIComponent(conv.telefono)}`);
      const data = await res.json();
      setMensajes(data.items ?? []);
      setConversaciones((prev) => prev.map((c) => c.id === conv.id ? { ...c, noLeidos: 0 } : c));
    } catch { /* silent */ }
    finally { setCargandoMensajes(false); }
  }, []);

  useEffect(() => {
    if (seleccionada) {
      cargarMensajes(seleccionada);
      const interval = setInterval(() => cargarMensajes(seleccionada), 8000);
      return () => clearInterval(interval);
    }
  }, [seleccionada, cargarMensajes]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes]);

  async function enviarRespuesta(texto?: string) {
    const msg = texto ?? respuesta;
    if (!msg.trim() || !seleccionada) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono: seleccionada.telefono, mensaje: msg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRespuesta('');
      cargarMensajes(seleccionada);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  async function enviarRecordatorios() {
    setEnviandoRecordatorios(true);
    try {
      const res = await fetch('/api/whatsapp/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await res.json();
      setResultadoRecordatorio(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviandoRecordatorios(false);
    }
  }

  const sortedConversaciones = [...conversaciones].sort((a, b) => {
    const pri = { urgente: 0, normal: 1, baja: 2 };
    const pd = (pri[a.prioridad] ?? 2) - (pri[b.prioridad] ?? 2);
    if (pd !== 0) return pd;
    return b.ultimaActividad.localeCompare(a.ultimaActividad);
  });

  const acciones = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="outlined"
        startIcon={<NotificationsOutlinedIcon />}
        onClick={() => setRecordatorioDialogo(true)}
        size="small"
      >
        Recordatorios mañana
      </Button>
      <IconButton size="small" onClick={cargarConversaciones} title="Actualizar">
        <RefreshIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  return (
    <PageContainer titulo="Mensajes WhatsApp" subtitulo="Bandeja de entrada con clasificación IA" acciones={acciones}>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card sx={{ overflow: 'hidden', display: 'flex', height: 'calc(100vh - 180px)', minHeight: 500 }}>
        {/* Conversation list */}
        <Box sx={{ width: 320, flexShrink: 0, borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Conversaciones
            </Typography>
          </Box>
          {cargando ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>
          ) : sortedConversaciones.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <WhatsAppIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                Sin mensajes aún. Configurá el webhook de Twilio para empezar a recibir mensajes.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {sortedConversaciones.map((conv) => {
                const isSelected = seleccionada?.id === conv.id;
                const isUrgente = conv.prioridad === 'urgente';
                return (
                  <Box
                    key={conv.id}
                    onClick={() => { setSeleccionada(conv); setRespuesta(''); }}
                    sx={{
                      px: 2, py: 1.5,
                      cursor: 'pointer',
                      borderBottom: '1px solid #F8FAFC',
                      backgroundColor: isSelected ? '#EFF6FF' : isUrgente ? '#FFF5F5' : 'transparent',
                      borderLeft: isUrgente ? '3px solid #EF4444' : isSelected ? '3px solid #2563EB' : '3px solid transparent',
                      '&:hover': { backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC' },
                      transition: 'background-color 0.1s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        backgroundColor: isUrgente ? '#FEE2E2' : '#EFF6FF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <WhatsAppIcon sx={{ fontSize: 18, color: isUrgente ? '#DC2626' : '#25D366' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                            {conv.nombre ?? conv.telefono}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem' }}>
                              {formatFechaCorta(conv.ultimaActividad)}
                            </Typography>
                            {conv.noLeidos > 0 && (
                              <Badge badgeContent={conv.noLeidos} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }} />
                            )}
                          </Box>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.25 }}>
                          {conv.ultimoMensaje}
                        </Typography>
                        {isUrgente && (
                          <Chip label="URGENTE" size="small" sx={{ mt: 0.5, height: 16, fontSize: '0.55rem', backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 700 }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Message thread */}
        {!seleccionada ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, color: '#94A3B8' }}>
            <WhatsAppIcon sx={{ fontSize: 56, color: '#CBD5E1' }} />
            <Typography variant="body2">Seleccioná una conversación para ver los mensajes</Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Thread header */}
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WhatsAppIcon sx={{ fontSize: 18, color: '#25D366' }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {seleccionada.nombre ?? seleccionada.telefono}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>{seleccionada.telefono}</Typography>
              </Box>
            </Box>

            {/* Messages */}
            <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5, backgroundColor: '#F0F2F5' }}>
              {cargandoMensajes && mensajes.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
              ) : mensajes.map((m) => {
                const esSaliente = m.direccion === 'saliente';
                const cfg = m.clasificacion ? CLASIFICACION_CONFIG[m.clasificacion] : null;
                const derCfg = m.derivarA ? DERIVACION_CONFIG[m.derivarA] : null;

                return (
                  <Box key={m.id} sx={{ display: 'flex', flexDirection: esSaliente ? 'row-reverse' : 'row', gap: 1, alignItems: 'flex-end' }}>
                    <Box sx={{ maxWidth: '75%' }}>
                      {/* Classification badges */}
                      {!esSaliente && (cfg || derCfg) && (
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexDirection: 'row', flexWrap: 'wrap' }}>
                          {cfg && (
                            <Chip label={cfg.label} size="small" sx={{ height: 18, fontSize: '0.6rem', backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700 }} />
                          )}
                          {derCfg && (
                            <Chip label={derCfg.label} size="small" sx={{ height: 18, fontSize: '0.6rem', backgroundColor: '#F1F5F9', color: derCfg.color, fontWeight: 600 }} />
                          )}
                        </Box>
                      )}

                      {/* Bubble */}
                      <Box sx={{
                        px: 1.5, py: 1,
                        backgroundColor: esSaliente ? '#DCF8C6' : '#fff',
                        borderRadius: esSaliente ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                      }}>
                        <Typography variant="body2" sx={{ color: '#0F172A', whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.85rem' }}>
                          {m.cuerpo}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', textAlign: 'right', mt: 0.25, fontSize: '0.6rem' }}>
                          {formatHora(m.creadoEn)}
                        </Typography>
                      </Box>

                      {/* Resumen IA */}
                      {!esSaliente && m.resumen && (
                        <Typography variant="caption" sx={{ color: '#7C3AED', display: 'block', mt: 0.5, fontStyle: 'italic', fontSize: '0.68rem' }}>
                          <SmartToyOutlinedIcon sx={{ fontSize: 10, mr: 0.25, verticalAlign: 'middle' }} />
                          {m.resumen}
                        </Typography>
                      )}

                      {/* Suggested reply */}
                      {!esSaliente && m.respuestaSugerida && !m.respondido && (
                        <Box sx={{ mt: 0.75, p: 1, backgroundColor: '#FFFBEB', border: '1px dashed #FCD34D', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 600, display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                            💡 Sugerencia IA:
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#78350F', display: 'block', lineHeight: 1.5, fontSize: '0.72rem' }}>
                            {m.respuestaSugerida}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75 }}>
                            <Tooltip title="Copiar sugerencia al campo de respuesta">
                              <Button size="small" variant="outlined" startIcon={<ContentCopyIcon sx={{ fontSize: '0.65rem !important' }} />}
                                sx={{ fontSize: '0.62rem', py: 0.25, px: 0.75, minHeight: 'auto', borderColor: '#FCD34D', color: '#92400E' }}
                                onClick={() => setRespuesta(m.respuestaSugerida!)}
                              >
                                Usar sugerencia
                              </Button>
                            </Tooltip>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Compose area */}
            <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #E2E8F0', backgroundColor: '#fff' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  size="small"
                  placeholder={`Responder a ${seleccionada.nombre ?? seleccionada.telefono}…`}
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarRespuesta(); } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />
                <IconButton
                  onClick={() => enviarRespuesta()}
                  disabled={!respuesta.trim() || enviando}
                  sx={{ color: '#fff', backgroundColor: '#25D366', '&:hover': { backgroundColor: '#128C7E' }, '&:disabled': { backgroundColor: '#E2E8F0' } }}
                >
                  {enviando ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block' }}>
                Enter para enviar · Shift+Enter nueva línea
              </Typography>
            </Box>
          </Box>
        )}
      </Card>

      {/* Reminders dialog */}
      <Dialog open={recordatorioDialogo} onClose={() => { setRecordatorioDialogo(false); setResultadoRecordatorio(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Enviar recordatorios de turno</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {!resultadoRecordatorio ? (
            <Alert severity="info">
              Se enviará un recordatorio de WhatsApp a todos los pacientes con turnos <strong>confirmados o pendientes de mañana</strong>.
              <br /><br />
              ⚠️ En modo sandbox de Twilio, solo recibirán el mensaje quienes hayan escrito primero al número de sandbox.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Alert severity="success">
                Se enviaron {(resultadoRecordatorio as Record<string, number>).enviados} de {(resultadoRecordatorio as Record<string, number>).total} recordatorios para el {resultadoRecordatorio.fecha as string}.
              </Alert>
              {((resultadoRecordatorio as { resultados?: Array<{ paciente: string; enviado: boolean; error?: string }> }).resultados ?? []).map((r, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2">{r.paciente}</Typography>
                  <Chip label={r.enviado ? '✓ Enviado' : r.error ?? 'Error'} size="small"
                    sx={{ backgroundColor: r.enviado ? '#D1FAE5' : '#FEE2E2', color: r.enviado ? '#065F46' : '#991B1B', fontSize: '0.65rem' }} />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => { setRecordatorioDialogo(false); setResultadoRecordatorio(null); }}>Cerrar</Button>
          {!resultadoRecordatorio && (
            <Button variant="contained" startIcon={<NotificationsOutlinedIcon />} disabled={enviandoRecordatorios} onClick={enviarRecordatorios}>
              {enviandoRecordatorios ? 'Enviando...' : 'Enviar recordatorios'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
