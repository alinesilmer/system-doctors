'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
// import Tabs from '@mui/material/Tabs';
// import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
// import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
// import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
// import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
// import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded';
import PageContainer from '@/components/ui/PageContainer';
import SelectorPaleta from '@/components/ui/SelectorPaleta';
import Pildora from '@/components/ui/Pildora';
import AvatarIniciales from '@/components/ui/AvatarIniciales';
import Etiqueta from '@/components/ui/Etiqueta';
// import TuboNivel from '@/components/ui/TuboNivel';
import { DISPLAY, flotante, tarjeta } from '@/components/ui/estilos';
// import { bloque, cifra, rotulo } from '@/components/ui/estilos';
import { useAuth } from '@/contexts/AuthContext';
// import { formatPrecio } from '@/lib/formato';
// import type { Plan, PlanId, CuentaUso, MetricaUso } from '@/lib/types';

// ─── Planes ──────────────────────────────────────────────────────────────────
// Membresía paga desactivada por ahora: todo lo de planes queda comentado
// (datos, pestaña "Plan" y su contenido) hasta que haya facturación real.

/*
const PLANES: Plan[] = [
  { id: 'gratuito',    nombre: 'Gratuito',    precioBase: 0,      color: 'var(--card)', descripcion: 'Para probar',  limites: { tokensIA: 10_000,  pacientes: 50,  almacenamientoMB: 100,    documentos: 20 } },
  { id: 'basico',      nombre: 'Básico',      precioBase: 5_000,  color: 'var(--lila)', descripcion: 'Un consultorio', limites: { tokensIA: 50_000,  pacientes: 200, almacenamientoMB: 500,    documentos: 100 } },
  { id: 'profesional', nombre: 'Profesional', precioBase: 12_000, color: 'var(--mint)', descripcion: 'Mucha agenda',  limites: { tokensIA: 200_000, pacientes: -1,  almacenamientoMB: 2_048,  documentos: -1 } },
  { id: 'clinica',     nombre: 'Clínica',     precioBase: 25_000, color: 'var(--sun)',  descripcion: 'Equipos',       limites: { tokensIA: 500_000, pacientes: -1,  almacenamientoMB: 10_240, documentos: -1 } },
];

// Todavía no hay medición real de uso ni facturación: estos valores son de
// ejemplo y la pantalla lo dice.
const PLAN_ACTUAL: PlanId = 'profesional';
const USO: CuentaUso = {
  tokensIA:         { usado: 163_400, limite: 200_000, unidad: 'tokens',    label: 'IA' },
  almacenamientoMB: { usado: 1_340,   limite: 2_048,   unidad: 'MB',        label: 'Espacio' },
  pacientes:        { usado: 87,      limite: -1,      unidad: 'pacientes', label: 'Pacientes' },
  documentos:       { usado: 58,      limite: -1,      unidad: 'docs',      label: 'Documentos' },
  periodoActual: '2025-05',
  costoExtraIA: 0,
  precioExtraToken: 1.5,
};

const SIN_LIMITE = -1;
const numero = new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 });
const espacio = (mb: number) => (mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`);

// Una cuota como tubo: se llena con lo usado y cambia de tono al acercarse al tope.
function Cuota({ metrica, formato = (n) => numero.format(n), orden }: { metrica: MetricaUso; formato?: (n: number) => string; orden: number }) {
  const libre = metrica.limite === SIN_LIMITE;
  const porcentaje = libre ? 100 : Math.min(100, Math.round((metrica.usado / metrica.limite) * 100));
  const alLimite = !libre && porcentaje >= 90;

  return (
    <Box className="in" style={{ '--n': orden } as React.CSSProperties} sx={{ ...tarjeta, display: 'grid', justifyItems: 'center', gap: 1, p: 2, textAlign: 'center' }}>
      <TuboNivel
        nivel={porcentaje}
        tono={libre ? 'var(--mint)' : alLimite ? 'var(--pink)' : porcentaje >= 70 ? 'var(--sun)' : 'var(--mint)'}
        agitar={alLimite}
      />
      <Box sx={{ ...cifra, fontSize: '1.7rem', color: alLimite ? 'var(--pink)' : 'var(--ink)' }}>
        {libre ? formato(metrica.usado) : `${porcentaje}%`}
      </Box>
      <Box sx={{ fontWeight: 800 }}>{metrica.label}</Box>
      <Box sx={{ color: 'var(--soft)', fontSize: '0.8rem', mt: -0.75 }}>
        {libre ? 'Sin límite' : `${formato(metrica.usado)} de ${formato(metrica.limite)}`}
      </Box>
    </Box>
  );
}
*/

function TituloSeccion({ icono, children }: { icono: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.3rem', mb: 2 }}>
      {icono}
      {children}
    </Box>
  );
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function CuentaPage() {
  const { perfil, cambiarNombre, cambiarContrasena, cerrarSesion } = useAuth();
  // const [tab, setTab] = useState(0);

  const [nombre, setNombre] = useState<string | null>(null); // null = no se está editando
  const [clave, setClave] = useState<{ actual: string; nueva: string } | null>(null);
  const [aviso, setAviso] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // const plan = PLANES.find((p) => p.id === PLAN_ACTUAL)!;
  const nombreVisible = perfil?.nombre ?? '';

  async function guardarNombre() {
    if (nombre === null) return;
    try {
      await cambiarNombre(nombre);
      setNombre(null);
      setAviso(null);
    } catch (e) {
      setAviso({ tipo: 'error', texto: (e as Error).message });
    }
  }

  async function guardarClave() {
    if (!clave) return;
    try {
      await cambiarContrasena(clave.actual, clave.nueva);
      setClave(null);
      setAviso({ tipo: 'success', texto: 'Contraseña cambiada' });
    } catch (e) {
      setAviso({ tipo: 'error', texto: (e as Error).message });
    }
  }

  return (
    <PageContainer titulo="Cuenta" acciones={<Pildora icono={<LogoutRoundedIcon />} onClick={cerrarSesion}>Salir</Pildora>}>
      {/* Quién sos */}
      <Box className="in" style={{ '--n': 1 } as React.CSSProperties} sx={{ ...flotante, display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, flexWrap: 'wrap', p: { xs: 2.5, sm: 3.5 }, mb: 3 }}>
        <AvatarIniciales nombre={nombreVisible} tam={6} />
        <Box sx={{ flex: '1 1 14rem', minWidth: 0 }}>
          {nombre === null ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box component="h2" sx={{ m: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', lineHeight: 1.1, overflowWrap: 'anywhere' }}>
                {nombreVisible}
              </Box>
              <Tooltip title="Cambiar nombre">
                <IconButton aria-label="Cambiar nombre" onClick={() => setNombre(nombreVisible)}><EditRoundedIcon fontSize="small" /></IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Box component="form" onSubmit={(e) => { e.preventDefault(); void guardarNombre(); }} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TextField value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus fullWidth label="Nombre" sx={{ maxWidth: '22rem' }} />
              <IconButton type="submit" aria-label="Guardar nombre"><CheckRoundedIcon /></IconButton>
              <IconButton aria-label="Cancelar" onClick={() => setNombre(null)}><CloseRoundedIcon /></IconButton>
            </Box>
          )}
          <Box sx={{ color: 'var(--soft)', mt: 0.25, overflowWrap: 'anywhere' }}>{perfil?.email}</Box>
        </Box>
        <Etiqueta tono="mint">{perfil?.rol?.replace('_', ' ') ?? 'usuario'}</Etiqueta>
      </Box>

      {aviso && <Alert severity={aviso.tipo} sx={{ mb: 3 }} onClose={() => setAviso(null)}>{aviso.texto}</Alert>}

      {/* Sin la pestaña "Plan" no hacen falta pestañas: el perfil se muestra directo.
      <Tabs className="in" style={{ '--n': 2 } as React.CSSProperties} value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<PersonRoundedIcon />} iconPosition="start" label="Perfil" />
        <Tab icon={<WorkspacePremiumRoundedIcon />} iconPosition="start" label="Plan" />
      </Tabs>
      */}

      {/* tab === 0 && */ (
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, alignItems: 'start' }}>
          <Box className="in" style={{ '--n': 3 } as React.CSSProperties} sx={{ ...tarjeta, p: 3 }}>
            <TituloSeccion icono={<PaletteRoundedIcon />}>Colores</TituloSeccion>
            <SelectorPaleta />
          </Box>

          <Box className="in" style={{ '--n': 4 } as React.CSSProperties} sx={{ ...tarjeta, p: 3 }}>
            <TituloSeccion icono={<LockRoundedIcon />}>Contraseña</TituloSeccion>
            {clave === null ? (
              <Button variant="outlined" onClick={() => { setClave({ actual: '', nueva: '' }); setAviso(null); }}>Cambiar</Button>
            ) : (
              <Box component="form" onSubmit={(e) => { e.preventDefault(); void guardarClave(); }} sx={{ display: 'grid', gap: 1.5 }}>
                <TextField label="Actual" type="password" autoComplete="current-password" value={clave.actual} onChange={(e) => setClave({ ...clave, actual: e.target.value })} fullWidth />
                <TextField label="Nueva" type="password" autoComplete="new-password" value={clave.nueva} onChange={(e) => setClave({ ...clave, nueva: e.target.value })} fullWidth />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button type="submit" variant="contained">Guardar</Button>
                  <Button variant="outlined" onClick={() => setClave(null)}>Cancelar</Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Membresía paga (pestaña "Plan"): desactivada por ahora.
      {tab === 1 && (
        <Box sx={{ display: 'grid', gap: 3 }}>
          // Tu plan
          <Box
            className="in"
            style={{ '--n': 3 } as React.CSSProperties}
            sx={{ borderRadius: '1.75rem', p: { xs: 2.5, sm: 3.5 }, backgroundColor: 'var(--solid)', color: 'var(--on-solid)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
          >
            <Box>
              <Box sx={{ ...rotulo, color: 'inherit', opacity: 0.7 }}>Tu plan</Box>
              <Box sx={{ ...cifra, fontSize: 'clamp(2rem, 6vw, 3.2rem)' }}>{plan.nombre}</Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Box sx={{ ...cifra, fontSize: 'clamp(1.6rem, 5vw, 2.4rem)' }}>{formatPrecio(plan.precioBase + USO.costoExtraIA)}</Box>
              <Box sx={{ opacity: 0.7, fontWeight: 800 }}>por mes</Box>
            </Box>
          </Box>

          // Uso
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box component="h2" sx={{ m: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.5rem' }}>Este mes</Box>
              <Etiqueta>Datos de ejemplo</Etiqueta>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))', gap: 2 }}>
              <Cuota metrica={USO.tokensIA} orden={4} />
              <Cuota metrica={USO.almacenamientoMB} formato={espacio} orden={5} />
              <Cuota metrica={USO.pacientes} orden={6} />
              <Cuota metrica={USO.documentos} orden={7} />
            </Box>
          </Box>

          // Planes
          <Box>
            <Box component="h2" sx={{ m: 0, mb: 1.5, fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.5rem' }}>Planes</Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))', gap: 2 }}>
              {PLANES.map((p, i) => {
                const actual = p.id === PLAN_ACTUAL;
                return (
                  <Box
                    key={p.id}
                    className="in"
                    style={{ '--n': 8 + i } as React.CSSProperties}
                    sx={{
                      ...bloque, display: 'grid', gap: 0.5, p: 2.5, backgroundColor: p.color,
                      color: p.color === 'var(--card)' ? 'var(--ink)' : 'var(--on-tint)',
                      outline: actual ? '3px solid var(--pink)' : 'none', outlineOffset: '3px',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ fontWeight: 800 }}>{p.nombre}</Box>
                      {actual && <Etiqueta tono="acento">Actual</Etiqueta>}
                    </Box>
                    <Box sx={{ ...cifra, fontSize: '1.9rem' }}>{p.precioBase === 0 ? 'Gratis' : formatPrecio(p.precioBase)}</Box>
                    <Box sx={{ opacity: 0.75, fontSize: '0.9rem' }}>{p.descripcion}</Box>
                    <Box sx={{ fontSize: '0.85rem', fontWeight: 800, mt: 0.5 }}>
                      {p.limites.pacientes === SIN_LIMITE ? 'Pacientes sin límite' : `${p.limites.pacientes} pacientes`} · {espacio(p.limites.almacenamientoMB)}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          // Tus datos: todavía no implementado, y se dice.
          <Box className="in" style={{ '--n': 12 } as React.CSSProperties} sx={{ ...tarjeta, p: 3, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 10rem', fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.3rem' }}>Tus datos</Box>
            <Etiqueta>Pronto</Etiqueta>
            <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} disabled>Exportar</Button>
            <Button variant="outlined" startIcon={<CleaningServicesRoundedIcon />} disabled>Limpiar</Button>
          </Box>
        </Box>
      )}
      */}
    </PageContainer>
  );
}
