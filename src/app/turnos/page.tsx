'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import PageContainer from '@/components/ui/PageContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmarDialogo from '@/components/ui/ConfirmarDialogo';
import EstadoChip from '@/components/ui/EstadoChip';
import Etiqueta from '@/components/ui/Etiqueta';
import Pildora from '@/components/ui/Pildora';
import { Camino, Parada, type EstadoParada } from '@/components/ui/Camino';
import { DISPLAY, redondoClaro, tarjeta } from '@/components/ui/estilos';
import { useColeccion } from '@/hooks/useRecurso';
import { useEliminar } from '@/hooks/useEliminar';
import { useAhora } from '@/hooks/useAhora';
import { aFechaIso, diasDeLaSemana, hoyIso } from '@/lib/fechas';
import type { Turno } from '@/lib/types';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/** La misma fecha, `dias` días después (o antes). */
function mover(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T00:00:00`);
  d.setDate(d.getDate() + dias);
  return aFechaIso(d);
}

function tituloDe(fecha: string, hoy: string): string {
  if (fecha === hoy) return 'Hoy';
  if (fecha === mover(hoy, 1)) return 'Mañana';
  const texto = new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function TurnosPage() {
  const hoy = hoyIso();
  const [dia, setDia] = useState(hoy);
  const semana = useMemo(() => diasDeLaSemana(dia), [dia]);

  // Sólo la semana a la vista; cambiar de semana trae la siguiente.
  const { items: turnos, cargando, error, recargar } = useColeccion<Turno>(
    `/api/turnos?desde=${semana[0]}&hasta=${semana[6]}`,
    'Error al cargar turnos',
  );
  const eliminacion = useEliminar<{ id: string }>((o) => `/api/turnos/${o.id}`, recargar);

  const porDia = useMemo(() => {
    const mapa = new Map<string, Turno[]>();
    for (const t of turnos) mapa.set(t.fecha, [...(mapa.get(t.fecha) ?? []), t]);
    return mapa;
  }, [turnos]);

  const delDia = porDia.get(dia) ?? [];
  const ahora = useAhora();
  const sigue = dia === hoy
    ? delDia.find((t) => t.horaInicio >= ahora && t.estado !== 'completado' && t.estado !== 'cancelado')
    : undefined;

  function estadoDe(t: Turno): EstadoParada {
    if (t.id === sigue?.id) return 'sigue';
    if (t.estado === 'completado' || dia < hoy || (dia === hoy && t.horaInicio < ahora)) return 'hecha';
    return 'pendiente';
  }

  return (
    <PageContainer titulo="Turnos" acciones={<Pildora href="/turnos/nuevo">Turno</Pildora>}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* La semana: un globo por día, un punto por turno. */}
      <Box className="in" style={{ '--n': 1 } as React.CSSProperties} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
        <Tooltip title="Semana anterior">
          <Box component="button" aria-label="Semana anterior" onClick={() => setDia(mover(dia, -7))} sx={{ ...redondoClaro, width: '2.6rem', height: '2.6rem' }}>
            <ChevronLeftRoundedIcon />
          </Box>
        </Tooltip>
        <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: { xs: 0.5, sm: 1 } }}>
          {semana.map((fecha, i) => {
            const cantidad = (porDia.get(fecha) ?? []).filter((t) => t.estado !== 'cancelado').length;
            const elegido = fecha === dia;
            const esHoy = fecha === hoy;
            return (
              <Box
                key={fecha}
                component="button"
                onClick={() => setDia(fecha)}
                aria-pressed={elegido}
                aria-label={`${tituloDe(fecha, hoy)}, ${cantidad} turnos`}
                sx={{
                  display: 'grid', justifyItems: 'center', gap: '0.15rem', py: 1.25, px: 0.25,
                  border: 0, cursor: 'pointer', font: 'inherit', borderRadius: '1.5rem',
                  backgroundColor: elegido ? 'var(--solid)' : esHoy ? 'var(--sun)' : 'var(--card)',
                  color: elegido ? 'var(--on-solid)' : esHoy ? 'var(--on-tint)' : 'var(--ink)',
                  transition: 'transform 0.25s var(--spring), background-color 0.2s, color 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Box sx={{ fontSize: { xs: '0.62rem', sm: '0.75rem' }, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>{DIAS[i]}</Box>
                <Box sx={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.7rem' }, lineHeight: 1 }}>{Number(fecha.slice(8))}</Box>
                <Box sx={{ display: 'flex', gap: '3px', height: 6 }}>
                  {Array.from({ length: Math.min(cantidad, 5) }, (_, k) => (
                    <Box key={k} sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--pink)' }} />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
        <Tooltip title="Semana siguiente">
          <Box component="button" aria-label="Semana siguiente" onClick={() => setDia(mover(dia, 7))} sx={{ ...redondoClaro, width: '2.6rem', height: '2.6rem' }}>
            <ChevronRightRoundedIcon />
          </Box>
        </Tooltip>
      </Box>

      <Box className="in" style={{ '--n': 2 } as React.CSSProperties} sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap', mt: 4, mb: 1 }}>
        <Box component="h2" sx={{ m: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.6rem', lineHeight: 1.1 }}>{tituloDe(dia, hoy)}</Box>
        <Box sx={{ color: 'var(--soft)', fontWeight: 800 }}>{delDia.length === 1 ? '1 turno' : `${delDia.length} turnos`}</Box>
        {dia !== hoy && (
          <Box component="button" onClick={() => setDia(hoy)} sx={{ border: 0, background: 'none', cursor: 'pointer', font: 'inherit', fontWeight: 800, color: 'var(--pink)', p: 0 }}>
            Ir a hoy
          </Box>
        )}
      </Box>

      {cargando ? (
        <LoadingScreen />
      ) : delDia.length === 0 ? (
        <EmptyState titulo="Día libre" icono={<BeachAccessRoundedIcon fontSize="inherit" />} />
      ) : (
        // La clave reinicia la entrada escalonada al cambiar de día.
        <Box key={dia} sx={{ ...tarjeta, py: 1, px: { xs: 1.5, sm: 3 }, maxWidth: '48rem' }}>
          <Camino>
            {delDia.map((t, i) => (
              <Parada
                key={t.id}
                orden={i}
                estado={estadoDe(t)}
                marca={t.horaInicio}
                titulo={
                  <Box component={Link} href={`/pacientes/${t.pacienteId}`} sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: 'var(--pink)' } }}>
                    {t.pacienteNombre ?? 'Paciente'}
                  </Box>
                }
                detalle={t.motivo}
                fin={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {t.id === sigue?.id ? <Etiqueta tono="acento">Sigue</Etiqueta> : <EstadoChip estado={t.estado} />}
                    <Tooltip title="Editar">
                      <IconButton component={Link} href={`/turnos/${t.id}/editar`} size="small" aria-label="Editar turno"><EditRoundedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" aria-label="Eliminar turno" onClick={() => eliminacion.pedir({ id: t.id })}><DeleteRoundedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            ))}
          </Camino>
        </Box>
      )}

      <ConfirmarDialogo
        abierto={!!eliminacion.objetivo}
        titulo="Eliminar turno"
        descripcion="¿Eliminar este turno? No se puede deshacer."
        textoConfirmar="Eliminar"
        cargando={eliminacion.eliminando}
        error={eliminacion.error}
        onConfirmar={eliminacion.confirmar}
        onCancelar={eliminacion.cancelar}
      />
    </PageContainer>
  );
}
