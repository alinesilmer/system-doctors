'use client';

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import type { EstadoTurno, Turno } from '@/lib/types';

const HORA_INICIO = 7;
const HORA_FIN = 20;
const SLOT_H = 44;
const HEADER_H = 60;
const TIME_W = 52;

const ESTADO_COLORS: Record<EstadoTurno, { bg: string; border: string; text: string }> = {
  pendiente:  { bg: '#FEF9C3', border: '#CA8A04', text: '#713F12' },
  confirmado: { bg: '#DBEAFE', border: '#2563EB', text: '#1E3A8A' },
  cancelado:  { bg: '#FEE2E2', border: '#DC2626', text: '#7F1D1D' },
  completado: { bg: '#D1FAE5', border: '#059669', text: '#064E3B' },
  no_asistio: { bg: '#F3F4F6', border: '#6B7280', text: '#374151' },
};

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function getWeekDates(base: Date): Date[] {
  const day = base.getDay();
  const mon = new Date(base);
  mon.setDate(base.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

interface Props {
  turnos: Turno[];
  onEditar: (id: string) => void;
  onEliminar: (id: string) => void;
}

export default function CalendarioTurnos({ turnos, onEditar, onEliminar }: Props) {
  const [base, setBase] = useState(() => new Date());
  const [popover, setPopover] = useState<{ anchor: HTMLElement; turno: Turno } | null>(null);

  const diasSemana = useMemo(() => getWeekDates(base), [base]);
  const hoy = new Date().toISOString().slice(0, 10);

  const turnosPorDia = useMemo(() => {
    const map = new Map<string, Turno[]>();
    for (const t of turnos) {
      const arr = map.get(t.fecha) ?? [];
      arr.push(t);
      map.set(t.fecha, arr);
    }
    return map;
  }, [turnos]);

  const totalSlots = (HORA_FIN - HORA_INICIO) * 2;
  const totalH = totalSlots * SLOT_H;

  function navSemana(delta: number) {
    setBase((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta * 7);
      return d;
    });
  }

  const inicio = diasSemana[0];
  const fin = diasSemana[6];
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
  const rangoLabel = `${inicio.toLocaleDateString('es-AR', opts)} — ${fin.toLocaleDateString('es-AR', { ...opts, year: 'numeric' })}`;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes() - HORA_INICIO * 60;
  const nowTop = (nowMin / 30) * SLOT_H;
  const showNowLine = nowMin > 0 && nowMin < (HORA_FIN - HORA_INICIO) * 60;

  return (
    <Box>
      {/* Header nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, borderBottom: '1px solid #E2E8F0' }}>
        <IconButton size="small" onClick={() => navSemana(-1)}><ChevronLeftIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={() => navSemana(1)}><ChevronRightIcon fontSize="small" /></IconButton>
        <Button size="small" startIcon={<TodayIcon fontSize="small" />} onClick={() => setBase(new Date())} sx={{ textTransform: 'none' }}>
          Hoy
        </Button>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', ml: 1 }}>
          {rangoLabel}
        </Typography>
      </Box>

      {/* Grid */}
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', minWidth: 640 }}>
          {/* Time axis */}
          <Box sx={{ width: TIME_W, flexShrink: 0 }}>
            <Box sx={{ height: HEADER_H }} />
            {Array.from({ length: totalSlots }, (_, i) => {
              const h = HORA_INICIO + Math.floor(i / 2);
              const m = i % 2 === 0 ? '00' : '30';
              return (
                <Box key={i} sx={{ height: SLOT_H, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', pr: 1, pt: '3px' }}>
                  {i % 2 === 0 && (
                    <Typography sx={{ fontSize: '0.62rem', color: '#94A3B8', userSelect: 'none' }}>
                      {String(h).padStart(2, '0')}:{m}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Day columns */}
          {diasSemana.map((dia, idx) => {
            const fechaStr = toDateStr(dia);
            const esHoy = fechaStr === hoy;
            const turnosDia = turnosPorDia.get(fechaStr) ?? [];

            return (
              <Box key={idx} sx={{ flex: 1, borderLeft: '1px solid #E2E8F0', minWidth: 80 }}>
                {/* Day header */}
                <Box sx={{
                  height: HEADER_H,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  backgroundColor: esHoy ? '#EFF6FF' : 'transparent',
                  borderBottom: '1px solid #E2E8F0',
                }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: esHoy ? '#2563EB' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {DIAS[idx]}
                  </Typography>
                  <Box sx={{
                    width: 30, height: 30, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: esHoy ? '#2563EB' : 'transparent',
                  }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: esHoy ? '#fff' : '#374151' }}>
                      {dia.getDate()}
                    </Typography>
                  </Box>
                </Box>

                {/* Time slots */}
                <Box sx={{ position: 'relative', height: totalH }}>
                  {Array.from({ length: totalSlots }, (_, i) => (
                    <Box key={i} sx={{
                      position: 'absolute',
                      top: i * SLOT_H,
                      left: 0,
                      right: 0,
                      height: SLOT_H,
                      borderTop: i % 2 === 0 ? '1px solid #F1F5F9' : '1px dashed #F8FAFC',
                    }} />
                  ))}

                  {/* Now line */}
                  {esHoy && showNowLine && (
                    <Box sx={{
                      position: 'absolute',
                      top: nowTop,
                      left: -4,
                      right: 0,
                      height: 2,
                      backgroundColor: '#EF4444',
                      zIndex: 4,
                      pointerEvents: 'none',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: -4,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: '#EF4444',
                      },
                    }} />
                  )}

                  {/* Appointment blocks */}
                  {turnosDia.map((t) => {
                    const startMin = timeToMin(t.horaInicio) - HORA_INICIO * 60;
                    const endMin = t.horaFin ? timeToMin(t.horaFin) - HORA_INICIO * 60 : startMin + 30;
                    const top = Math.max(0, (startMin / 30) * SLOT_H);
                    const height = Math.max(((endMin - startMin) / 30) * SLOT_H - 2, 22);
                    const colors = ESTADO_COLORS[t.estado];

                    return (
                      <Box
                        key={t.id}
                        onClick={(e) => setPopover({ anchor: e.currentTarget, turno: t })}
                        sx={{
                          position: 'absolute',
                          top: top + 1,
                          left: 2,
                          right: 2,
                          height,
                          backgroundColor: colors.bg,
                          borderLeft: `3px solid ${colors.border}`,
                          borderRadius: '0 4px 4px 0',
                          px: 0.75,
                          py: 0.25,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          zIndex: 1,
                          transition: 'filter 0.1s',
                          '&:hover': { filter: 'brightness(0.93)', zIndex: 3 },
                        }}
                      >
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: colors.text, lineHeight: 1.3 }}>
                          {t.horaInicio}
                        </Typography>
                        {height > 30 && (
                          <Typography sx={{ fontSize: '0.58rem', color: colors.text, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.85 }}>
                            {t.pacienteNombre ?? t.motivo}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Appointment popover */}
      <Popover
        open={!!popover}
        anchorEl={popover?.anchor}
        onClose={() => setPopover(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', p: 2, maxWidth: 260 } } }}
      >
        {popover && (() => {
          const t = popover.turno;
          const colors = ESTADO_COLORS[t.estado];
          return (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {t.pacienteNombre ?? 'Paciente'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    {t.horaInicio} — {t.horaFin}
                  </Typography>
                </Box>
                <Box sx={{ display: 'inline-flex', px: 1, py: 0.25, borderRadius: 1, backgroundColor: colors.bg }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: colors.text }}>
                    {t.estado}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 1.5 }}>
                {t.motivo}
              </Typography>
              {t.notas && (
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5, fontStyle: 'italic' }}>
                  {t.notas}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => { setPopover(null); onEditar(t.id); }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" sx={{ color: '#EF4444' }} onClick={() => { setPopover(null); onEliminar(t.id); }}>
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          );
        })()}
      </Popover>
    </Box>
  );
}
