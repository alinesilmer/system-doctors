import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import type { TonoEtiqueta } from '@/components/ui/Etiqueta';
import type { EstadoPresupuesto, TipoItemPresupuesto } from '@/lib/types';

/** Presentación de los estados y tipos de ítem, compartida por listado, detalle y formulario. */

export const ESTADOS: Record<EstadoPresupuesto, { label: string; tono: TonoEtiqueta; color: string; bg: string }> = {
  borrador:  { label: 'Borrador',  tono: 'sun',    color: 'var(--warn)', bg: 'var(--sun)' },
  enviado:   { label: 'Enviado',   tono: 'mint',   color: 'var(--ink)',  bg: 'var(--mint)' },
  aceptado:  { label: 'Aceptado',  tono: 'ok',     color: 'var(--ok)',   bg: 'color-mix(in srgb, var(--ok) 18%, transparent)' },
  rechazado: { label: 'Rechazado', tono: 'mal',    color: 'var(--bad)',  bg: 'color-mix(in srgb, var(--bad) 16%, transparent)' },
  vencido:   { label: 'Vencido',   tono: 'neutro', color: 'var(--soft)', bg: 'var(--bg)' },
};

/** Los mismos estados, en orden, para armar selectores. */
export const ESTADOS_LISTA = (Object.keys(ESTADOS) as EstadoPresupuesto[]).map((value) => ({
  value,
  ...ESTADOS[value],
}));

export const TIPO_ICONS: Record<TipoItemPresupuesto, React.ReactElement> = {
  practica:       <LocalHospitalOutlinedIcon sx={{ fontSize: 16 }} />,
  tratamiento:    <MedicalServicesOutlinedIcon sx={{ fontSize: 16 }} />,
  examen_externo: <ScienceOutlinedIcon sx={{ fontSize: 16 }} />,
};

export const TIPO_LABELS: Record<TipoItemPresupuesto, string> = {
  practica:       'Práctica',
  tratamiento:    'Tratamiento',
  examen_externo: 'Examen externo',
};

export const TIPO_COLORS: Record<TipoItemPresupuesto, { bg: string; color: string }> = {
  practica:       { bg: 'var(--mint)', color: 'var(--on-tint)' },
  tratamiento:    { bg: 'var(--lila)', color: 'var(--on-tint)' },
  examen_externo: { bg: 'var(--sun)', color: 'var(--on-tint)' },
};
