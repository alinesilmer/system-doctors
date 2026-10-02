import Box from '@mui/material/Box';

const TRAZO = 'M2 18H40l5-5 5 5h7l4 7 7-23 7 27 4-11h9l6-6 6 6h20';

/** Línea de signos vitales con un pulso que la recorre. Indica que algo está en marcha. */
export default function LineaDePulso({ ancho = 9 }: { ancho?: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 126 34"
      aria-hidden
      sx={{
        width: `${ancho}rem`, height: 'auto', overflow: 'visible', display: 'block',
        '@keyframes pulso': { from: { strokeDashoffset: 1.3 }, to: { strokeDashoffset: 0 } },
        '& path': { fill: 'none', strokeWidth: 3.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
        // Un tramo corto del trazo que avanza: el latido.
        '& .latido': { strokeDasharray: '0.3 1', animation: 'pulso 1.4s linear infinite' },
      }}
    >
      <path d={TRAZO} stroke="var(--line)" />
      <path className="latido" d={TRAZO} pathLength={1} stroke="var(--pink)" />
    </Box>
  );
}
