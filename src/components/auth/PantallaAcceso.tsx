'use client';

import { useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Mascota, Vara } from '@/components/ui/Mascota';
import { DISPLAY, flotante } from '@/components/ui/estilos';

export interface CampoAcceso {
  nombre: string;
  label: string;
  tipo?: 'text' | 'email' | 'password';
  autoComplete: string;
}

interface Props {
  /** Una o dos palabras: "Hola", "Crear cuenta". */
  titulo: string;
  campos: CampoAcceso[];
  /** Texto del botón: un verbo. */
  accion: string;
  onEnviar: (valores: Record<string, string>) => Promise<void>;
  /** Enlace a la otra pantalla de acceso. */
  alternativa: { texto: string; href: string };
  /** Valores para completar el formulario de un toque (la cuenta demo). */
  demo?: { etiqueta: string; valores: Record<string, string> };
}

/**
 * Marco común de login y registro: la mascota de un lado, un formulario corto
 * del otro. Cada pantalla sólo declara sus campos y qué hacer al enviar.
 */
export default function PantallaAcceso({ titulo, campos, accion, onEnviar, alternativa, demo }: Props) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [verClave, setVerClave] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await onEnviar(valores);
    } catch (err) {
      setError((err as Error).message);
      setEnviando(false);
    }
    // Si salió bien no se reactiva el botón: la pantalla está por cambiar.
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
      {/* Lado de marca */}
      <Box
        sx={{
          display: 'grid', placeContent: 'center', justifyItems: 'center', gap: 2, p: 4,
          backgroundColor: 'var(--panel)', color: 'var(--on-panel)',
          borderRadius: { xs: '0 0 2.5rem 2.5rem', md: '0 3rem 3rem 0' },
        }}
      >
        <Box className="in"><Mascota tam={11} /></Box>
        <Box className="in" style={{ '--n': 1 } as React.CSSProperties} sx={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1 }}>
          MediSystem<Box component="span" sx={{ color: 'var(--pink)' }}>.</Box>
        </Box>
        <Box className="in" style={{ '--n': 2 } as React.CSSProperties} sx={{ opacity: 0.75, fontWeight: 800, display: { xs: 'none', md: 'block' } }}>
          Tu consultorio, en orden.
        </Box>
      </Box>

      {/* Formulario */}
      <Box sx={{ display: 'grid', placeContent: 'center', p: { xs: 2.5, sm: 4 } }}>
        <Box
          component="form"
          onSubmit={enviar}
          noValidate
          className="in"
          style={{ '--n': 1 } as React.CSSProperties}
          sx={{ ...flotante, width: 'min(26rem, calc(100vw - 2.5rem))', p: { xs: 3, sm: 4 }, display: 'grid', gap: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Vara tam={2.6} />
            <Box component="h1" sx={{ m: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: '2.2rem', lineHeight: 1 }}>
              {titulo}<Box component="span" sx={{ color: 'var(--pink)' }}>.</Box>
            </Box>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {campos.map((campo, i) => {
            const esClave = campo.tipo === 'password';
            return (
              <TextField
                key={campo.nombre}
                id={`acceso-${campo.nombre}`}
                label={campo.label}
                type={esClave && verClave ? 'text' : campo.tipo ?? 'text'}
                autoComplete={campo.autoComplete}
                autoFocus={i === 0}
                required
                fullWidth
                size="medium"
                value={valores[campo.nombre] ?? ''}
                onChange={(e) => setValores((v) => ({ ...v, [campo.nombre]: e.target.value }))}
                slotProps={esClave ? {
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setVerClave((v) => !v)} aria-label={verClave ? 'Ocultar contraseña' : 'Ver contraseña'} edge="end">
                          {verClave ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                } : undefined}
              />
            );
          })}

          <Button type="submit" variant="contained" size="large" disabled={enviando} endIcon={<ArrowForwardRoundedIcon />}>
            {enviando ? 'Un momento…' : accion}
          </Button>

          {demo && (
            <Button variant="outlined" onClick={() => { setValores(demo.valores); setError(null); }}>
              {demo.etiqueta}
            </Button>
          )}

          <Box component={Link} href={alternativa.href} sx={{ justifySelf: 'center', color: 'var(--soft)', fontWeight: 800, textDecoration: 'none', '&:hover': { color: 'var(--pink)' } }}>
            {alternativa.texto}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
