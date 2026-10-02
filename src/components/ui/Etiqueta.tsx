import Box from '@mui/material/Box';

export type TonoEtiqueta = 'neutro' | 'acento' | 'sun' | 'mint' | 'lila' | 'ok' | 'mal';

const TONOS: Record<TonoEtiqueta, { backgroundColor: string; color: string }> = {
  neutro: { backgroundColor: 'var(--bg)',   color: 'var(--ink)' },
  acento: { backgroundColor: 'var(--pink)', color: 'var(--on-accent)' },
  sun:    { backgroundColor: 'var(--sun)',  color: 'var(--on-tint)' },
  mint:   { backgroundColor: 'var(--mint)', color: 'var(--on-tint)' },
  lila:   { backgroundColor: 'var(--lila)', color: 'var(--on-tint)' },
  ok:     { backgroundColor: 'color-mix(in srgb, var(--ok) 18%, transparent)',  color: 'var(--ok)' },
  mal:    { backgroundColor: 'color-mix(in srgb, var(--bad) 16%, transparent)', color: 'var(--bad)' },
};

interface Props {
  tono?: TonoEtiqueta;
  icono?: React.ReactNode;
  children: React.ReactNode;
}

/** Píldora de una o dos palabras: un estado, un dato, una advertencia. */
export default function Etiqueta({ tono = 'neutro', icono, children }: Props) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        px: '0.75rem', py: '0.3rem', borderRadius: '999px',
        fontWeight: 800, fontSize: '0.8rem', whiteSpace: 'nowrap',
        '& svg': { fontSize: '1.05rem' },
        ...TONOS[tono],
      }}
    >
      {icono}
      {children}
    </Box>
  );
}
