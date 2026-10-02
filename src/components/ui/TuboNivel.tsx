import Box from '@mui/material/Box';

interface Props {
  /** Cuánto está lleno, de 0 a 100. */
  nivel: number;
  /** Altura de la línea punteada de referencia (un mínimo, un tope), de 0 a 100. */
  marca?: number;
  /** Color del contenido. */
  tono?: string;
  /** Se sacude para pedir atención (vacío, al límite). */
  agitar?: boolean;
  /** Si se pasa, el tubo es un botón. */
  onClick?: () => void;
  etiqueta?: string;
}

/**
 * Un tubo de ensayo que se llena hasta un nivel. Sirve para cualquier
 * "cuánto queda" o "cuánto se usó": stock, cuotas, espacio.
 */
export default function TuboNivel({ nivel, marca, tono = 'var(--mint)', agitar, onClick, etiqueta }: Props) {
  return (
    <Box
      component={onClick ? 'button' : 'div'}
      onClick={onClick}
      aria-label={etiqueta}
      aria-hidden={onClick ? undefined : true}
      sx={{
        position: 'relative', width: '4.2rem', height: '6.2rem', p: 0, flexShrink: 0, overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        border: '5px solid var(--ink)', borderTopWidth: 0, borderRadius: '0 0 2.1rem 2.1rem', backgroundColor: 'var(--bg)',
        ...(agitar && { animation: 'wobble 1.5s ease-in-out infinite' }),
        ...(marca !== undefined && {
          '&::before': {
            content: '""', position: 'absolute', left: 0, right: 0, bottom: `${marca}%`, zIndex: 1,
            borderTop: '3px dashed var(--ink)', opacity: 0.35,
          },
        }),
      }}
    >
      <Box
        sx={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: `${Math.max(0, Math.min(100, nivel))}%`,
          backgroundColor: tono,
          transition: 'height 0.5s var(--spring)', animation: 'fill 1s cubic-bezier(0.3, 0.9, 0.3, 1) both 0.3s',
        }}
      />
    </Box>
  );
}
