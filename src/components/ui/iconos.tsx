import { createSvgIcon } from '@mui/material/utils';

/**
 * Íconos médicos propios, dibujados con el mismo trazo redondeado que el resto.
 * Son `SvgIcon` de MUI: heredan color y tamaño igual que cualquier otro ícono,
 * y van dentro del bundle (ni imágenes ni pedidos extra).
 */

const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const EstetoscopioIcon = createSvgIcon(
  <g {...trazo}>
    <path d="M5 3H4v6a5 5 0 0 0 10 0V3h-1" />
    <path d="M9 14v2.5a4.5 4.5 0 0 0 9 0V14" />
    <circle cx="18" cy="11.5" r="2.5" />
  </g>,
  'Estetoscopio',
);

export const CruzMedicaIcon = createSvgIcon(
  <path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
  'CruzMedica',
);

export const PulsoIcon = createSvgIcon(
  <path {...trazo} d="M2 12h4l2-5 4 11 3-8 1.5 2H22" />,
  'Pulso',
);
