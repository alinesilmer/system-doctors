'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import PageContainer from '@/components/ui/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Buscador from '@/components/ui/Buscador';
import Pildora from '@/components/ui/Pildora';
import { DISPLAY, tonoDe } from '@/components/ui/estilos';
import Etiqueta from '@/components/ui/Etiqueta';
import { usePacientes } from '@/hooks/usePacientes';
import { useColeccion } from '@/hooks/useRecurso';
import { hoyIso } from '@/lib/fechas';
import type { Paciente, Turno } from '@/lib/types';

/** Un turno está activo mientras todavía se espera al paciente. */
const ACTIVOS: Turno['estado'][] = ['pendiente', 'confirmado'];

/** "Hoy 10:30" o "vie 2 · 10:30". */
function cuando(turno: Turno, hoy: string): string {
  if (turno.fecha === hoy) return `Hoy ${turno.horaInicio}`;
  const dia = new Date(`${turno.fecha}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' });
  return `${dia} · ${turno.horaInicio}`;
}

/** Un paciente como figura de persona: la cabeza sobre los hombros, que llevan el nombre. */
function Persona({ paciente, turno, orden }: { paciente: Paciente; turno?: string; orden: number }) {
  const nombre = `${paciente.nombre} ${paciente.apellido}`;
  return (
    <Box
      component={Link}
      href={`/pacientes/${paciente.id}`}
      className="in"
      // Sólo los primeros se escalonan: una lista larga no debe tardar en aparecer.
      style={{ '--n': Math.min(orden, 12) } as React.CSSProperties}
      sx={{
        display: 'grid', justifyItems: 'center', color: 'var(--ink)', textDecoration: 'none',
        transition: 'transform 0.25s var(--spring)',
        '&:hover': { transform: 'translateY(-6px)' },
        '&:hover .cabeza': { animation: 'wobble 0.6s' },
        '&:hover .hombros': { boxShadow: 'var(--shadow)' },
      }}
    >
      {/* La cabeza: sólo un color propio de cada paciente. */}
      <Box
        className="cabeza"
        aria-hidden
        sx={{
          position: 'relative', zIndex: 1, width: '5.4rem', height: '5.4rem', borderRadius: '50%',
          backgroundColor: tonoDe(nombre), border: '0.4rem solid var(--bg)', mb: '-1.6rem',
        }}
      />
      <Box
        className="hombros"
        sx={{
          width: '100%', minWidth: 0, display: 'grid', justifyItems: 'center', gap: 0.75, textAlign: 'center',
          pt: '2.3rem', pb: 2, px: 1.5,
          backgroundColor: 'var(--card)', borderRadius: '5rem 5rem 1.5rem 1.5rem',
          transition: 'box-shadow 0.25s',
        }}
      >
        <Box sx={{ fontWeight: 800, lineHeight: 1.2, maxWidth: '100%', overflowWrap: 'anywhere' }}>{nombre}</Box>
        {turno && <Etiqueta tono="acento">{turno}</Etiqueta>}
      </Box>
    </Box>
  );
}

function Grupo({ titulo, cantidad, children }: { titulo: string; cantidad: number; children: React.ReactNode }) {
  return (
    <Box component="section" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25, mb: 2 }}>
        <Box component="h2" sx={{ m: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.1 }}>{titulo}</Box>
        <Box sx={{ color: 'var(--soft)', fontWeight: 800 }}>{cantidad}</Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10.5rem, 1fr))', gap: 2.5 }}>
        {children}
      </Box>
    </Box>
  );
}

export default function PacientesPage() {
  const router = useRouter();
  const { pacientes, cargando, error } = usePacientes();
  const hoy = hoyIso();
  // De hoy en adelante: lo pasado ya no es un turno activo.
  const { items: turnos } = useColeccion<Turno>(`/api/turnos?desde=${hoy}`, 'Error al cargar turnos');
  const [busqueda, setBusqueda] = useState('');

  /** El próximo turno activo de cada paciente (la API los devuelve por fecha y hora). */
  const proximoTurno = useMemo(() => {
    const mapa = new Map<string, Turno>();
    for (const t of turnos) {
      if (ACTIVOS.includes(t.estado) && !mapa.has(t.pacienteId)) mapa.set(t.pacienteId, t);
    }
    return mapa;
  }, [turnos]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pacientes;
    return pacientes.filter(
      (p) =>
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) ||
        `${p.apellido} ${p.nombre}`.toLowerCase().includes(q) ||
        // Fichas viejas pueden no traer estos campos.
        p.dni?.includes(q) ||
        p.telefono?.includes(q),
    );
  }, [pacientes, busqueda]);

  // Con turno: primero quien viene antes. Sin turno: en el orden del padrón.
  const clave = (t: Turno) => `${t.fecha} ${t.horaInicio}`;
  const conTurno = filtrados
    .filter((p) => proximoTurno.has(p.id))
    .sort((a, b) => clave(proximoTurno.get(a.id)!).localeCompare(clave(proximoTurno.get(b.id)!)));
  const sinTurno = filtrados.filter((p) => !proximoTurno.has(p.id));

  return (
    <PageContainer titulo="Pacientes" acciones={<Pildora href="/pacientes/nuevo">Paciente</Pildora>}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Buscador valor={busqueda} onCambio={setBusqueda} ayuda="Nombre o DNI" cantidad={filtrados.length} />

      {cargando ? (
        <LoadingScreen />
      ) : pacientes.length === 0 ? (
        <EmptyState
          titulo="Sin pacientes"
          descripcion="Cargá el primero."
          icono={<PeopleAltRoundedIcon fontSize="inherit" />}
          accion={{ label: 'Paciente', onClick: () => router.push('/pacientes/nuevo') }}
        />
      ) : filtrados.length === 0 ? (
        <EmptyState titulo="Nadie con ese nombre" icono={<SearchOffRoundedIcon fontSize="inherit" />} />
      ) : (
        <>
          {conTurno.length > 0 && (
            <Grupo titulo="Con turno" cantidad={conTurno.length}>
              {conTurno.map((p, i) => <Persona key={p.id} paciente={p} turno={cuando(proximoTurno.get(p.id)!, hoy)} orden={i} />)}
            </Grupo>
          )}
          {sinTurno.length > 0 && (
            <Grupo titulo={conTurno.length > 0 ? 'Sin turno' : 'Todos'} cantidad={sinTurno.length}>
              {sinTurno.map((p, i) => <Persona key={p.id} paciente={p} orden={conTurno.length + i} />)}
            </Grupo>
          )}
        </>
      )}
    </PageContainer>
  );
}
