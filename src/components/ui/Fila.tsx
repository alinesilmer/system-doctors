'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { cifra } from './estilos';

export interface AccionFila {
  titulo: string;
  icono: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

interface Props {
  /** Ícono dentro de un círculo de color, o un avatar ya armado en `inicio`. */
  icono?: React.ReactNode;
  tono?: string;
  inicio?: React.ReactNode;
  titulo: React.ReactNode;
  detalle?: React.ReactNode;
  etiquetas?: React.ReactNode;
  /** Dato principal a la derecha: un importe, una cantidad. */
  valor?: React.ReactNode;
  /** A dónde lleva tocar la fila. */
  href?: string;
  acciones?: AccionFila[];
  orden?: number;
}

/** Las dos acciones que tiene casi toda fila. */
export const editar = (href: string): AccionFila => ({ titulo: 'Editar', icono: <EditRoundedIcon fontSize="small" />, href });
export const eliminar = (onClick: () => void): AccionFila => ({ titulo: 'Eliminar', icono: <DeleteRoundedIcon fontSize="small" />, onClick });

/** Un registro de un listado: ícono, nombre fuerte, una línea de detalle, etiquetas, un dato y acciones. */
export default function Fila({ icono, tono = 'var(--lila)', inicio, titulo, detalle, etiquetas, valor, href, acciones = [], orden = 0 }: Props) {
  return (
    <Box
      className="in"
      style={{ '--n': Math.min(orden, 12) } as React.CSSProperties}
      sx={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
        p: 1.5, pr: 2, borderRadius: '1.5rem', backgroundColor: 'var(--card)',
        transition: 'transform 0.2s var(--spring), box-shadow 0.2s',
        '&:hover': { transform: 'translateX(5px)', boxShadow: 'var(--shadow)' },
      }}
    >
      {inicio ?? (icono && (
        <Box sx={{ width: '3rem', height: '3rem', flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', backgroundColor: tono, color: 'var(--on-tint)' }}>
          {icono}
        </Box>
      ))}

      <Box sx={{ flex: '1 1 12rem', minWidth: 0 }}>
        {href ? (
          // El enlace cubre toda la fila; las acciones quedan por encima.
          <Box component={Link} href={href} sx={{ fontWeight: 800, color: 'inherit', textDecoration: 'none', '&::after': { content: '""', position: 'absolute', inset: 0, borderRadius: 'inherit' } }}>
            {titulo}
          </Box>
        ) : (
          <Box sx={{ fontWeight: 800 }}>{titulo}</Box>
        )}
        {detalle && <Box sx={{ color: 'var(--soft)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{detalle}</Box>}
      </Box>

      {etiquetas && <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>{etiquetas}</Box>}
      {valor != null && <Box sx={{ ...cifra, fontSize: '1.35rem', minWidth: '6rem', textAlign: 'right' }}>{valor}</Box>}

      {acciones.length > 0 && (
        <Box sx={{ position: 'relative', display: 'flex', gap: 0.25 }}>
          {acciones.map((a) => (
            <Tooltip key={a.titulo} title={a.titulo}>
              {a.href
                ? <IconButton component={Link} href={a.href} size="small" aria-label={a.titulo}>{a.icono}</IconButton>
                : <IconButton size="small" aria-label={a.titulo} onClick={a.onClick}>{a.icono}</IconButton>}
            </Tooltip>
          ))}
        </Box>
      )}
    </Box>
  );
}
