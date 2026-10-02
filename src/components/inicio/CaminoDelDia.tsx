import Box from '@mui/material/Box';
import type { Turno } from '@/lib/types';

/**
 * El día dibujado como un camino sinuoso: una parada por turno, el tramo ya
 * recorrido en trazo lleno y un pin que salta sobre el turno que sigue.
 */

type Punto = { x: number; y: number };

const ANCHO = 900;
const ALTO = 330;
const TRAZO = 'M40 240 C160 240 160 90 300 90 S440 240 580 240 S740 90 860 90';

// Las tres curvas de TRAZO como Bézier cúbicas explícitas (la "S" refleja el control anterior).
const CURVAS: [Punto, Punto, Punto, Punto][] = [
  [{ x: 40, y: 240 }, { x: 160, y: 240 }, { x: 160, y: 90 }, { x: 300, y: 90 }],
  [{ x: 300, y: 90 }, { x: 440, y: 90 }, { x: 440, y: 240 }, { x: 580, y: 240 }],
  [{ x: 580, y: 240 }, { x: 720, y: 240 }, { x: 740, y: 90 }, { x: 860, y: 90 }],
];

function bezier([a, b, c, d]: [Punto, Punto, Punto, Punto], t: number): Punto {
  const u = 1 - t;
  const k = (p: 'x' | 'y') => u * u * u * a[p] + 3 * u * u * t * b[p] + 3 * u * t * t * c[p] + t * t * t * d[p];
  return { x: k('x'), y: k('y') };
}

// Muestreo del trazo: permite ubicar un punto a una fracción de su largo sin medir el DOM.
const MUESTRAS: { punto: Punto; largo: number }[] = (() => {
  const salida = [{ punto: CURVAS[0][0], largo: 0 }];
  for (const curva of CURVAS) {
    for (let i = 1; i <= 60; i++) {
      const punto = bezier(curva, i / 60);
      const previo = salida[salida.length - 1];
      salida.push({ punto, largo: previo.largo + Math.hypot(punto.x - previo.punto.x, punto.y - previo.punto.y) });
    }
  }
  return salida;
})();
const LARGO = MUESTRAS[MUESTRAS.length - 1].largo;

function puntoEn(fraccion: number): Punto {
  const objetivo = fraccion * LARGO;
  return (MUESTRAS.find((m) => m.largo >= objetivo) ?? MUESTRAS[MUESTRAS.length - 1]).punto;
}

/** Dónde cae la parada `i` de `n` sobre el camino, como fracción de su largo. */
function fraccionDe(i: number, n: number): number {
  return n === 1 ? 0.5 : 0.03 + (i * 0.94) / (n - 1);
}

const primerNombre = (t: Turno) => {
  const nombre = t.pacienteNombre ?? '';
  // "Rodríguez, Carla" → "Carla"; "Carla Rodríguez" → "Carla".
  return (nombre.includes(',') ? nombre.split(',')[1] : nombre).trim().split(' ')[0];
};

interface Props {
  turnos: Turno[];
  proximo: Turno | null;
}

export default function CaminoDelDia({ turnos, proximo }: Props) {
  const n = turnos.length;
  const indiceProximo = proximo ? turnos.findIndex((t) => t.id === proximo.id) : -1;
  // Sin turno por delante, el día ya se caminó entero.
  const recorrido = indiceProximo === -1 ? 1 : fraccionDe(indiceProximo, n);
  const conNombres = n <= 8;

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        component="svg"
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        role="img"
        aria-label={`Camino del día: ${n} turnos${proximo ? `, sigue ${proximo.pacienteNombre ?? 'un paciente'} a las ${proximo.horaInicio}` : ''}`}
        sx={{ display: 'block', width: '100%', minWidth: '40rem', height: 'auto', overflow: 'visible' }}
      >
        <path d={TRAZO} fill="none" stroke="var(--line)" strokeWidth={12} strokeLinecap="round" strokeDasharray="2 22" />
        <Box
          component="path"
          d={TRAZO}
          pathLength={1}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={1 - recorrido}
          style={{ '--len': 1 } as React.CSSProperties}
          sx={{ animation: 'draw 1.8s cubic-bezier(0.3, 0.9, 0.3, 1) both 0.3s' }}
        />

        {turnos.map((t, i) => {
          const p = puntoEn(fraccionDe(i, n));
          const sigue = i === indiceProximo;
          const hecha = t.estado === 'completado' || (indiceProximo === -1 ? true : i < indiceProximo);
          // El texto va del lado donde hay lugar: debajo en las crestas, arriba en los valles.
          // El que sigue lleva el pin encima, así que su texto siempre va debajo.
          const arriba = sigue || p.y < ALTO / 2;
          return (
            <g key={t.id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={sigue ? 17 : 13}
                strokeWidth={5}
                stroke={sigue ? 'var(--pink)' : 'var(--ink)'}
                fill={sigue ? 'var(--pink)' : hecha ? 'var(--ink)' : 'var(--card)'}
              />
              <text x={p.x} y={arriba ? p.y + 46 : p.y - (conNombres ? 50 : 30)} textAnchor="middle" fontSize={17} fontWeight={800} fill="var(--ink)">
                {t.horaInicio}
              </text>
              {conNombres && (
                <text x={p.x} y={arriba ? p.y + 66 : p.y - 30} textAnchor="middle" fontSize={15} fill="var(--soft)">
                  {primerNombre(t)}
                </text>
              )}
              {sigue && (
                <g transform={`translate(${p.x - 24} ${p.y - 66})`}>
                  <Box component="g" sx={{ animation: 'hop 1.1s ease-in-out infinite 2.1s', transformBox: 'fill-box' }}>
                    <path d="M24 46S42 30 42 18a18 18 0 0 0-36 0c0 12 18 28 18 28z" fill="var(--pink)" />
                    {/* Cruz médica dentro del pin. */}
                    <path d="M22 11h4v5h5v4h-5v5h-4v-5h-5v-4h5z" fill="var(--on-accent)" />
                  </Box>
                </g>
              )}
            </g>
          );
        })}
      </Box>
    </Box>
  );
}
