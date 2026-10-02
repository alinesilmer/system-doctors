'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import BedtimeRoundedIcon from '@mui/icons-material/BedtimeRounded';
import PageContainer from '@/components/ui/PageContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import EmptyState from '@/components/ui/EmptyState';
import Bloque from '@/components/ui/Bloque';
import Pildora from '@/components/ui/Pildora';
import CaminoDelDia from '@/components/inicio/CaminoDelDia';
import { Mascota } from '@/components/ui/Mascota';
import { EstetoscopioIcon, PulsoIcon } from '@/components/ui/iconos';
import { cifra, flotante, redondo, rotulo } from '@/components/ui/estilos';
import { useResumenInicio } from '@/hooks/useResumenInicio';
import { useAuth } from '@/contexts/AuthContext';

// La hora del navegador no existe en el servidor: allí se asume de día.
const sinSuscripcion = () => () => {};
const esDeNoche = () => { const h = new Date().getHours(); return h >= 20 || h < 6; };

/** Sol que gira despacio de día; luna quieta de noche. */
function Astro() {
  const noche = useSyncExternalStore(sinSuscripcion, esDeNoche, () => false);
  if (noche) return <BedtimeRoundedIcon sx={{ fontSize: '3.2rem', color: 'var(--glow)' }} />;

  return (
    <Box component="svg" viewBox="0 0 60 60" aria-hidden sx={{ width: '3.5rem', height: '3.5rem', flexShrink: 0, animation: 'spin 18s linear infinite' }}>
      <g stroke="var(--glow)" strokeWidth={5} strokeLinecap="round">
        <path d="M30 4v8M30 48v8M4 30h8M48 30h8M11.6 11.6l5.7 5.7M42.7 42.7l5.7 5.7M11.6 48.4l5.7-5.7M42.7 17.3l5.7-5.7" />
      </g>
      <circle cx={30} cy={30} r={12} fill="var(--glow)" />
    </Box>
  );
}

export default function InicioPage() {
  const { perfil } = useAuth();
  const resumen = useResumenInicio();
  const { proximo, turnosHoy, stockBajo } = resumen;
  // "Dra. Ana Pérez" → "Ana": el tratamiento no es el nombre (y su punto chocaría con el del título).
  const palabras = perfil?.nombre?.split(' ').filter(Boolean) ?? [];
  const nombre = palabras.find((p) => !p.endsWith('.')) ?? palabras[0]?.replace(/.$/, '') ?? '';

  const titulo = (
    <>Hola{nombre && <>, <Box component="span" sx={{ color: 'var(--pink)' }}>{nombre}</Box></>}</>
  );

  return (
    <PageContainer titulo={titulo} icono={<Astro />}>
      {resumen.error && <Alert severity="error" sx={{ mb: 2 }}>{resumen.error}</Alert>}

      {resumen.cargando ? (
        <LoadingScreen />
      ) : (
        <>
          {turnosHoy.length === 0 ? (
            <EmptyState titulo="Día libre" descripcion="Hoy no hay turnos." ilustracion={<Mascota animo="dormida" />} />
          ) : (
            <Box className="in" style={{ '--n': 1 } as React.CSSProperties}>
              <CaminoDelDia turnos={turnosHoy} proximo={proximo} />
            </Box>
          )}

          {proximo && (
            <Box
              className="in"
              style={{ '--n': 2 } as React.CSSProperties}
              sx={{ ...flotante, display: 'inline-flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', p: '1rem 1.25rem 1rem 1.5rem', mt: 1 }}
            >
              <Box sx={{ width: '3.2rem', height: '3.2rem', borderRadius: '50%', display: 'grid', placeItems: 'center', backgroundColor: 'var(--sun)', color: 'var(--on-tint)' }}>
                <EstetoscopioIcon />
              </Box>
              <Box>
                <Box sx={rotulo}>Sigue</Box>
                <Box sx={{ ...cifra, fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', lineHeight: 1.05 }}>{proximo.pacienteNombre ?? 'Paciente'}</Box>
              </Box>
              <Box component="time" sx={{ ...cifra, fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: 'var(--pink)' }}>{proximo.horaInicio}</Box>
              <Box component={Link} href={`/pacientes/${proximo.pacienteId}`} aria-label="Abrir ficha" sx={redondo}>
                <ArrowForwardRoundedIcon />
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, mt: 4 }}>
            <Bloque titulo="Hoy" valor={turnosHoy.length} icono={<PulsoIcon />} href="/turnos" orden={3} />
            <Bloque titulo="Pacientes" valor={resumen.pacientes} icono={<PeopleAltRoundedIcon />} href="/pacientes" tono="var(--mint)" orden={4} />
            <Bloque
              titulo={stockBajo.length === 1 ? 'Falta' : 'Faltan'}
              valor={stockBajo.length}
              icono={<Inventory2RoundedIcon />}
              href="/stock"
              tono="var(--sun)"
              atencion={stockBajo.length > 0}
              orden={5}
            />
          </Box>

          <Box className="in" style={{ '--n': 6 } as React.CSSProperties} sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 4 }}>
            <Pildora href="/pacientes/nuevo">Paciente</Pildora>
            <Pildora href="/turnos/nuevo">Turno</Pildora>
            <Pildora href="/stock/nuevo">Stock</Pildora>
          </Box>
        </>
      )}
    </PageContainer>
  );
}
