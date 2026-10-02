'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import { pedirApi } from '@/lib/api/cliente';
import PageContainer from '@/components/ui/PageContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import EmptyState from '@/components/ui/EmptyState';
import AvatarIniciales from '@/components/ui/AvatarIniciales';
import Etiqueta from '@/components/ui/Etiqueta';
import Pildora from '@/components/ui/Pildora';
import { DISPLAY, flotante, latido, redondo } from '@/components/ui/estilos';
import type { ConversacionWA, MensajeWA } from '@/lib/types';

/** Una palabra por tipo de mensaje, tal como lo clasificó la IA. */
const CLASIFICACION: Record<string, string> = {
  urgencia: 'Urgente',
  consulta_medica: 'Consulta',
  receta: 'Receta',
  turno: 'Turno',
  confirmacion: 'Confirma',
  informacion: 'Info',
  secretaria: 'Secretaría',
  otro: 'Otro',
};

const PRIORIDAD = { urgente: 0, normal: 1, baja: 2 };

interface ResultadoRecordatorios {
  fecha: string;
  total: number;
  enviados: number;
  yaRecordados: number;
  resultados: { paciente: string; enviado: boolean; error?: string }[];
}

/** Cadencia del sondeo de la bandeja, en milisegundos. */
const INTERVALO_CONVERSACIONES = 10_000;
const INTERVALO_MENSAJES = 8_000;

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
  const [resultadoRecordatorio, setResultadoRecordatorio] = useState<ResultadoRecordatorios | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cargarConversaciones = useCallback(() => {
    return pedirApi<{ items: ConversacionWA[] }>('/api/whatsapp/conversaciones')
      .then((data) => setConversaciones(data.items ?? []))
      .catch(() => { /* el sondeo reintenta solo */ })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    void cargarConversaciones();
    const interval = setInterval(() => {
      // No gastamos lecturas de Firestore mientras la pestaña está en segundo plano.
      if (document.visibilityState === 'visible') void cargarConversaciones();
    }, INTERVALO_CONVERSACIONES);
    return () => clearInterval(interval);
  }, [cargarConversaciones]);

  const cargarMensajes = useCallback((conv: ConversacionWA) => {
    return pedirApi<{ items: MensajeWA[] }>(`/api/whatsapp/conversaciones?telefono=${encodeURIComponent(conv.telefono)}`)
      .then((data) => {
        setMensajes(data.items ?? []);
        setConversaciones((prev) => prev.map((c) => c.id === conv.id ? { ...c, noLeidos: 0 } : c));
      })
      .catch(() => { /* el sondeo reintenta solo */ })
      .finally(() => setCargandoMensajes(false));
  }, []);

  useEffect(() => {
    if (!seleccionada) return;
    void cargarMensajes(seleccionada);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') void cargarMensajes(seleccionada);
    }, INTERVALO_MENSAJES);
    return () => clearInterval(interval);
  }, [seleccionada, cargarMensajes]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes]);

  function abrir(conv: ConversacionWA) {
    if (conv.id === seleccionada?.id) return;
    setMensajes([]);
    setRespuesta('');
    setCargandoMensajes(true);
    setSeleccionada(conv);
  }

  async function enviarRespuesta() {
    if (!respuesta.trim() || !seleccionada) return;
    setEnviando(true);
    setError(null);
    try {
      await pedirApi('/api/whatsapp/send', {
        metodo: 'POST',
        cuerpo: { telefono: seleccionada.telefono, mensaje: respuesta },
      });
      setRespuesta('');
      void cargarMensajes(seleccionada);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  async function enviarRecordatorios() {
    setEnviandoRecordatorios(true);
    try {
      setResultadoRecordatorio(await pedirApi<ResultadoRecordatorios>('/api/whatsapp/reminders', {
        metodo: 'POST',
        cuerpo: {},
        mensajeError: 'No se pudieron enviar los recordatorios',
      }));
    } catch (e) {
      setRecordatorioDialogo(false);
      setError((e as Error).message);
    } finally {
      setEnviandoRecordatorios(false);
    }
  }

  const ordenadas = [...conversaciones].sort((a, b) =>
    (PRIORIDAD[a.prioridad] ?? 2) - (PRIORIDAD[b.prioridad] ?? 2) || b.ultimaActividad.localeCompare(a.ultimaActividad));

  // Respuestas que sugirió la IA para lo que todavía no se contestó: quedan a un toque.
  const sugerencias = [...new Set(
    mensajes.filter((m) => m.direccion === 'entrante' && !m.respondido && m.respuestaSugerida).map((m) => m.respuestaSugerida!),
  )].slice(-3);

  const ultimaClasificacion = [...mensajes].reverse().find((m) => m.clasificacion)?.clasificacion;
  const nombreDe = (c: ConversacionWA) => c.nombre ?? c.telefono;

  return (
    <PageContainer
      titulo="Mensajes"
      acciones={<Pildora icono={<NotificationsActiveRoundedIcon />} onClick={() => setRecordatorioDialogo(true)}>Recordar mañana</Pildora>}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {cargando ? (
        <LoadingScreen />
      ) : ordenadas.length === 0 ? (
        <EmptyState titulo="Bandeja vacía" descripcion="Los mensajes de WhatsApp aparecen acá." icono={<ChatRoundedIcon fontSize="inherit" />} />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 19rem) minmax(0, 1fr)' }, gap: 2.5, alignItems: 'start' }}>
          {/* Conversaciones */}
          <Box className="in" style={{ '--n': 1 } as React.CSSProperties} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 1 }}>
            {ordenadas.map((conv) => {
              const elegida = seleccionada?.id === conv.id;
              const urgente = conv.prioridad === 'urgente';
              return (
                <Box
                  key={conv.id}
                  component="button"
                  onClick={() => abrir(conv)}
                  aria-pressed={elegida}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: '1.5rem', textAlign: 'left',
                    border: 0, cursor: 'pointer', font: 'inherit',
                    backgroundColor: elegida ? 'var(--solid)' : 'var(--card)', color: elegida ? 'var(--on-solid)' : 'var(--ink)',
                    transition: 'transform 0.2s var(--spring), background-color 0.2s, color 0.2s',
                    '&:hover': { transform: 'translateX(5px)' },
                  }}
                >
                  <AvatarIniciales nombre={nombreDe(conv)} tam={3} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombreDe(conv)}</Box>
                    <Box sx={{ opacity: 0.7, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.ultimoMensaje}</Box>
                  </Box>
                  {urgente && <Box sx={latido} />}
                  {conv.noLeidos > 0 && (
                    <Box sx={{ minWidth: '1.5rem', height: '1.5rem', px: 0.5, borderRadius: '999px', display: 'grid', placeItems: 'center', backgroundColor: 'var(--pink)', color: 'var(--on-accent)', fontWeight: 800, fontSize: '0.78rem' }}>
                      {conv.noLeidos}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Chat */}
          <Box className="in" style={{ '--n': 2 } as React.CSSProperties} sx={{ ...flotante, display: 'flex', flexDirection: 'column', p: 2.5, height: { md: 'calc(100vh - 12rem)' }, minHeight: '26rem' }}>
            {!seleccionada ? (
              <EmptyState titulo="Elegí un chat" icono={<ChatRoundedIcon fontSize="inherit" />} />
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2, borderBottom: '3px dotted var(--line)' }}>
                  <AvatarIniciales nombre={nombreDe(seleccionada)} tam={3} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.1 }}>{nombreDe(seleccionada)}</Box>
                    <Box sx={{ color: 'var(--soft)', fontSize: '0.85rem' }}>{seleccionada.telefono}</Box>
                  </Box>
                  {seleccionada.prioridad === 'urgente'
                    ? <Etiqueta tono="acento">Urgente</Etiqueta>
                    : ultimaClasificacion && <Etiqueta>{CLASIFICACION[ultimaClasificacion] ?? 'Otro'}</Etiqueta>}
                </Box>

                <Box ref={scrollRef} aria-live="polite" sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, py: 2 }}>
                  {cargandoMensajes && mensajes.length === 0 ? <LoadingScreen /> : mensajes.map((m) => {
                    const mio = m.direccion === 'saliente';
                    return (
                      <Box
                        key={m.id}
                        sx={{
                          maxWidth: '80%', px: 2, py: 1, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
                          alignSelf: mio ? 'flex-end' : 'flex-start',
                          backgroundColor: mio ? 'var(--solid)' : 'var(--bg)', color: mio ? 'var(--on-solid)' : 'var(--ink)',
                          borderRadius: mio ? '1.3rem 1.3rem 0.35rem 1.3rem' : '1.3rem 1.3rem 1.3rem 0.35rem',
                          animation: 'up 0.35s both',
                        }}
                      >
                        {m.cuerpo}
                        <Box sx={{ fontSize: '0.7rem', opacity: 0.6, textAlign: 'right', mt: 0.25 }}>
                          {new Date(m.creadoEn).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {sugerencias.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pb: 1.5 }}>
                    {sugerencias.map((s) => (
                      <Box
                        key={s}
                        component="button"
                        onClick={() => setRespuesta(s)}
                        title={s}
                        sx={{
                          maxWidth: '100%', px: 1.75, py: 0.75, borderRadius: '999px', border: 0, cursor: 'pointer', font: 'inherit',
                          fontWeight: 800, fontSize: '0.85rem', backgroundColor: 'var(--mint)', color: 'var(--on-tint)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          transition: 'transform 0.2s var(--spring)', '&:hover': { transform: 'translateY(-3px)' },
                        }}
                      >
                        {s}
                      </Box>
                    ))}
                  </Box>
                )}

                <Box
                  component="form"
                  onSubmit={(e) => { e.preventDefault(); void enviarRespuesta(); }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'var(--bg)', borderRadius: '999px', p: '0.3rem 0.3rem 0.3rem 1.2rem' }}
                >
                  <Box
                    component="input"
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    placeholder="Escribir…"
                    aria-label="Mensaje"
                    autoComplete="off"
                    sx={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'none', color: 'inherit', font: 'inherit', py: '0.7rem' }}
                  />
                  <Box component="button" type="submit" aria-label="Enviar" disabled={!respuesta.trim() || enviando} sx={{ ...redondo, '&:disabled': { opacity: 0.4, cursor: 'default' } }}>
                    <SendRoundedIcon />
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Recordatorios */}
      <Dialog open={recordatorioDialogo} onClose={() => { setRecordatorioDialogo(false); setResultadoRecordatorio(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>Recordar mañana</DialogTitle>
        <DialogContent>
          {!resultadoRecordatorio ? (
            <Box sx={{ color: 'var(--soft)' }}>Un WhatsApp a cada paciente con turno mañana.</Box>
          ) : (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Box sx={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.6rem' }}>
                {resultadoRecordatorio.enviados} de {resultadoRecordatorio.total} enviados
              </Box>
              {resultadoRecordatorio.yaRecordados > 0 && (
                <Box sx={{ color: 'var(--soft)' }}>{resultadoRecordatorio.yaRecordados} ya estaban avisados.</Box>
              )}
              {resultadoRecordatorio.resultados.map((r, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, py: 0.5 }}>
                  <Box sx={{ fontWeight: 800 }}>{r.paciente}</Box>
                  <Etiqueta tono={r.enviado ? 'ok' : 'mal'}>{r.enviado ? 'Enviado' : r.error ?? 'Error'}</Etiqueta>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => { setRecordatorioDialogo(false); setResultadoRecordatorio(null); }}>Cerrar</Button>
          {!resultadoRecordatorio && (
            <Button variant="contained" disabled={enviandoRecordatorios} onClick={enviarRecordatorios}>
              {enviandoRecordatorios ? 'Enviando…' : 'Enviar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
