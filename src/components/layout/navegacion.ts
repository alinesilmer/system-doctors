import type { SvgIconComponent } from '@mui/icons-material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import HealthAndSafetyRoundedIcon from '@mui/icons-material/HealthAndSafetyRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import { CruzMedicaIcon } from '@/components/ui/iconos';

export interface ItemNav {
  label: string;
  href: string;
  icon: SvgIconComponent;
  /** Qué aviso numérico muestra sobre el ícono, si corresponde. */
  aviso?: 'mensajes' | 'stock';
  /** Tono de su mosaico en la pantalla "Más". */
  tono?: string;
}

/** Lo de todos los días: siempre a un toque, en el dock. */
export const DOCK: ItemNav[] = [
  { label: 'Inicio',    href: '/inicio',    icon: HomeRoundedIcon },
  { label: 'Pacientes', href: '/pacientes', icon: PeopleAltRoundedIcon },
  { label: 'Turnos',    href: '/turnos',    icon: CalendarMonthRoundedIcon },
  { label: 'Mensajes',  href: '/mensajes',  icon: ChatRoundedIcon, aviso: 'mensajes' },
  { label: 'Stock',     href: '/stock',     icon: Inventory2RoundedIcon, aviso: 'stock' },
  { label: 'Más',       href: '/mas',       icon: AppsRoundedIcon },
];

/** El resto de las secciones, detrás de "Más". */
export const MAS: ItemNav[] = [
  { label: 'Presupuestos',   href: '/presupuestos',           icon: ReceiptLongRoundedIcon,     tono: 'var(--sun)' },
  { label: 'Prácticas',      href: '/practicas',              icon: CruzMedicaIcon },
  { label: 'Tratamientos',   href: '/tratamientos',           icon: ScienceRoundedIcon,         tono: 'var(--mint)' },
  { label: 'Obras sociales', href: '/obras-sociales',         icon: HealthAndSafetyRoundedIcon, tono: 'var(--lila)' },
  { label: 'Documentos',     href: '/documentos',             icon: DescriptionRoundedIcon },
  { label: 'Medicamentos',   href: '/medicamentos',           icon: MedicationRoundedIcon,      tono: 'var(--mint)' },
  { label: 'Contenido IA',   href: '/contenido',              icon: AutoAwesomeRoundedIcon,     tono: 'var(--lila)' },
  { label: 'Invitaciones',   href: '/pacientes/invitaciones', icon: MailRoundedIcon,            tono: 'var(--sun)' },
];

const coincide = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * El ítem del dock que corresponde a una ruta. Gana la coincidencia más larga
 * (así `/pacientes/invitaciones` no marca "Pacientes") y todo lo que vive
 * detrás de "Más" marca "Más".
 */
export function itemActivo(pathname: string): string | null {
  const mejor = [...DOCK, ...MAS]
    .filter((i) => coincide(pathname, i.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (!mejor) return null;
  return MAS.includes(mejor) ? '/mas' : mejor.href;
}
