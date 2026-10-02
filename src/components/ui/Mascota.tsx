import Box from '@mui/material/Box';

/**
 * La serpiente de la casa. Sale de la vara de Asclepio, el símbolo de la
 * medicina: enroscada en la vara es la marca; suelta, acompaña los momentos
 * sin datos. SVG en línea y animaciones de `transform`: no pesa ni pide red.
 */

/** Marca: la serpiente en su vara. Saca la lengua cada tanto. */
export function Vara({ tam = 2.75 }: { tam?: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 48 48"
      aria-hidden
      sx={{
        width: `${tam}rem`, height: `${tam}rem`, flexShrink: 0, display: 'block', overflow: 'visible',
        '@keyframes lengua': { '0%, 86%, 100%': { transform: 'scaleX(0)' }, '90%, 96%': { transform: 'scaleX(1)' } },
        '& .lengua': { transformBox: 'fill-box', transformOrigin: 'right center', animation: 'lengua 5s ease-in-out infinite' },
      }}
    >
      <line x1="24" y1="7" x2="24" y2="44" stroke="var(--staff)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="24" cy="6" r="2.6" fill="var(--staff)" />
      <path
        d="M15 39C33 39 33 31 24 29.500 15 28 15 20 24 18.500 31 17.300 31 11.500 26 10.500"
        fill="none" stroke="var(--pet)" strokeWidth="5" strokeLinecap="round"
      />
      {/* Este tramo de vara pasa por delante: da la vuelta de la serpiente. */}
      <line x1="24" y1="26" x2="24" y2="33" stroke="var(--staff)" strokeWidth="3.5" />
      <path className="lengua" d="M19 11l-3.500-.7M19 11l-3 1.600" fill="none" stroke="var(--ink)" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="23" cy="10.500" rx="4.300" ry="3.500" fill="var(--pet)" />
      <circle cx="21.800" cy="9.800" r="0.950" fill="var(--pet-on)" />
    </Box>
  );
}

interface MascotaProps {
  /** Despierta parpadea; dormida descansa (para un día sin turnos). */
  animo?: 'despierta' | 'dormida';
  /** Ancho, en rem. */
  tam?: number;
}

/** La serpiente enroscada, con su cruz. Ilustración para estados vacíos. */
export function Mascota({ animo = 'despierta', tam = 9 }: MascotaProps) {
  const dormida = animo === 'dormida';

  return (
    <Box
      component="svg"
      viewBox="0 0 120 104"
      aria-hidden
      sx={{
        width: `${tam}rem`, height: 'auto', display: 'block', overflow: 'visible',
        '@keyframes respirar': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-3px)' } },
        '@keyframes parpadear': { '0%, 92%, 100%': { transform: 'scaleY(1)' }, '96%': { transform: 'scaleY(0.1)' } },
        '@keyframes zeta': { '0%': { opacity: 0, transform: 'translate(0, 4px)' }, '40%': { opacity: 1 }, '100%': { opacity: 0, transform: 'translate(6px, -10px)' } },
        '& .cabeza': { animation: `respirar ${dormida ? 4.5 : 3}s ease-in-out infinite` },
        '& .ojos': { transformBox: 'fill-box', transformOrigin: 'center', animation: 'parpadear 4.5s infinite' },
        '& .zeta': { animation: 'zeta 3s ease-out infinite' },
      }}
    >
      <ellipse cx="60" cy="95" rx="42" ry="6" fill="var(--line)" />
      <ellipse cx="60" cy="80" rx="36" ry="13" fill="none" stroke="var(--pet)" strokeWidth="13" />
      <ellipse cx="60" cy="66" rx="25" ry="10" fill="none" stroke="var(--pet)" strokeWidth="13" />
      {/* Su cruz, como un parche en el lomo. */}
      <path d="M57.500 86h5v3.500H66v5h-3.500V98h-5v-3.500H54v-5h3.500z" fill="var(--pet-on)" transform="translate(0 -8)" />

      <g className="cabeza">
        <path d="M82 62C97 52 93 30 75 28" fill="none" stroke="var(--pet)" strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="64" cy="28" rx="16" ry="12" fill="var(--pet)" />
        {dormida ? (
          <>
            <path d="M54 26q3.500 3 7 0M66 26q3.500 3 7 0" fill="none" stroke="var(--pet-on)" strokeWidth="2" strokeLinecap="round" />
            <text className="zeta" x="84" y="16" fontSize="13" fontWeight="800" fill="var(--soft)">z</text>
            <text className="zeta" x="93" y="8" fontSize="9" fontWeight="800" fill="var(--soft)" style={{ animationDelay: '1s' }}>z</text>
          </>
        ) : (
          <g className="ojos">
            <circle cx="57.500" cy="25" r="3.400" fill="var(--pet-on)" />
            <circle cx="69.500" cy="25" r="3.400" fill="var(--pet-on)" />
            <circle cx="58.200" cy="25.500" r="1.600" fill="var(--ink)" />
            <circle cx="70.200" cy="25.500" r="1.600" fill="var(--ink)" />
          </g>
        )}
        <path d="M59 32.500q4.500 3 9 0" fill="none" stroke="var(--pet-on)" strokeWidth="1.800" strokeLinecap="round" />
      </g>
    </Box>
  );
}
