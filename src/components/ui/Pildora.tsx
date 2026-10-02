'use client';

import Link from 'next/link';
import Button from '@mui/material/Button';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

interface Props {
  /** Una palabra: "Paciente", "Turno". */
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Por defecto un "+": la mayoría de estas acciones crea algo. */
  icono?: React.ReactNode;
}

/** Acción principal de una pantalla: píldora llena con el ícono en un círculo que gira. */
export default function Pildora({ children, href, onClick, disabled, icono = <AddRoundedIcon /> }: Props) {
  const comun = {
    variant: 'contained' as const,
    startIcon: icono,
    disabled,
    sx: {
      pl: '0.9rem',
      '& .MuiButton-startIcon': {
        width: '1.9rem', height: '1.9rem', borderRadius: '50%', display: 'grid', placeItems: 'center',
        backgroundColor: 'color-mix(in srgb, currentColor 18%, transparent)',
        transition: 'transform 0.35s',
      },
      '&:hover .MuiButton-startIcon': { transform: 'rotate(180deg)' },
    },
  };

  return href
    ? <Button component={Link} href={href} {...comun}>{children}</Button>
    : <Button onClick={onClick} {...comun}>{children}</Button>;
}
