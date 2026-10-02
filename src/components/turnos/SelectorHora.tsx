'use client';

import Box from '@mui/material/Box';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import WbTwilightRoundedIcon from '@mui/icons-material/WbTwilightRounded';
import { rotulo } from '@/components/ui/estilos';

/** Jornada que se ofrece para agendar, en minutos desde medianoche. */
const APERTURA = 8 * 60;
const CIERRE = 20 * 60;
const MEDIODIA = 13 * 60;

export const aMinutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

export const aHora = (minutos: number) =>
  `${String(Math.floor(minutos / 60) % 24).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;

export interface Ocupado {
  inicio: string;
  fin: string;
}

interface Props {
  valor: string;
  onCambio: (hora: string) => void;
  /** Duración del turno en minutos: define cada cuánto hay un horario y qué se superpone. */
  duracion: number;
  /** Turnos ya agendados ese día. */
  ocupados: Ocupado[];
  /** Hora actual (`HH:MM`) si el día elegido es hoy: lo anterior ya pasó. */
  desde?: string;
}

/**
 * Elegir la hora de un toque: todos los horarios del día a la vista, con los
 * ocupados y los que ya pasaron fuera de juego. Sin ruedas ni teclear.
 */
export default function SelectorHora({ valor, onCambio, duracion, ocupados, desde }: Props) {
  const paso = duracion <= 15 ? 15 : 30;
  const horarios: number[] = [];
  for (let m = APERTURA; m < CIERRE; m += paso) horarios.push(m);
  // Un turno ya guardado a una hora fuera de la grilla (09:10) sigue siendo elegible.
  if (valor && !horarios.includes(aMinutos(valor))) horarios.push(aMinutos(valor));
  horarios.sort((a, b) => a - b);

  const seSuperpone = (inicio: number) =>
    ocupados.some((o) => inicio < Math.max(aMinutos(o.fin), aMinutos(o.inicio) + 1) && inicio + duracion > aMinutos(o.inicio));

  const grupos = [
    { titulo: 'Mañana', icono: <WbSunnyRoundedIcon />, horas: horarios.filter((m) => m < MEDIODIA) },
    { titulo: 'Tarde', icono: <WbTwilightRoundedIcon />, horas: horarios.filter((m) => m >= MEDIODIA) },
  ];

  return (
    <Box role="radiogroup" aria-label="Hora del turno" sx={{ display: 'grid', gap: 2 }}>
      {grupos.map((grupo) => (
        <Box key={grupo.titulo}>
          <Box sx={{ ...rotulo, color: 'var(--soft)', display: 'flex', alignItems: 'center', gap: 0.75, mb: 1, '& svg': { fontSize: '1.1rem', color: 'var(--glow)' } }}>
            {grupo.icono}
            {grupo.titulo}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(4.6rem, 1fr))', gap: 1 }}>
            {grupo.horas.map((minutos) => {
              const hora = aHora(minutos);
              const elegida = hora === valor;
              const ocupada = !elegida && seSuperpone(minutos);
              const pasada = !elegida && desde !== undefined && minutos < aMinutos(desde);
              const fuera = ocupada || pasada;
              return (
                <Box
                  key={hora}
                  component="button"
                  type="button"
                  role="radio"
                  aria-checked={elegida}
                  aria-label={ocupada ? `${hora}, ocupado` : hora}
                  disabled={fuera}
                  onClick={() => onCambio(hora)}
                  sx={{
                    py: 1, borderRadius: '999px', border: '2px solid', cursor: 'pointer',
                    font: 'inherit', fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                    borderColor: elegida ? 'var(--solid)' : 'var(--line)',
                    backgroundColor: elegida ? 'var(--solid)' : 'var(--card)',
                    color: elegida ? 'var(--on-solid)' : 'var(--ink)',
                    transition: 'transform 0.2s var(--spring), background-color 0.15s, border-color 0.15s, color 0.15s',
                    '&:hover:not(:disabled)': { transform: 'translateY(-3px)', borderColor: elegida ? 'var(--solid)' : 'var(--pink)' },
                    '&:disabled': {
                      cursor: 'default', color: 'var(--soft)', backgroundColor: 'var(--bg)', borderColor: 'transparent', opacity: 0.6,
                      // Tachado sólo lo ocupado: lo que ya pasó simplemente se apaga.
                      textDecoration: ocupada ? 'line-through' : 'none',
                    },
                  }}
                >
                  {hora}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
