'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Avatar from '@mui/material/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const NAV = [
  { label: 'Inicio',          href: '/inicio',                  icon: DashboardOutlinedIcon },
  { label: 'Pacientes',       href: '/pacientes',               icon: PeopleAltOutlinedIcon },
  { label: 'Invitaciones',    href: '/pacientes/invitaciones',  icon: PersonAddOutlinedIcon },
  { label: 'Turnos',          href: '/turnos',                  icon: CalendarMonthOutlinedIcon },
  { label: 'Obras Sociales',  href: '/obras-sociales',          icon: MedicalServicesOutlinedIcon },
  { label: 'Documentos',      href: '/documentos',              icon: ArticleOutlinedIcon },
  { label: 'Presupuestos',    href: '/presupuestos',            icon: ReceiptLongOutlinedIcon },
  { label: 'Prácticas',       href: '/practicas',               icon: LocalHospitalOutlinedIcon },
  { label: 'Tratamientos',    href: '/tratamientos',            icon: MedicalServicesOutlinedIcon },
  { label: 'Contenido IA',    href: '/contenido',               icon: AutoAwesomeOutlinedIcon },
  { label: 'Mensajes',        href: '/mensajes',                icon: ChatOutlinedIcon },
  { label: 'Stock',           href: '/stock',                   icon: InventoryOutlinedIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { perfil, cerrarSesion } = useAuth();

  return (
    <Box
      component="aside"
      sx={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 3, py: 3, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
            }}
          >
            <Image src="/logo.png" alt="Logo" width={24} height={24} />
          </Box>
          <Box>
            <Typography
              sx={{
                color: '#F8FAFC',
                fontWeight: 700,
                fontSize: '1rem',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              MediSystem
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.7rem', lineHeight: 1 }}>
              Gestión Médica
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          sx={{
            color: '#475569',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            px: 1.5,
            pb: 1,
            pt: 0.5,
          }}
        >
          Menú principal
        </Typography>

        {NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/inicio' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: isActive ? 'rgba(37,99,235,0.18)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(37,99,235,0.22)' : 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: 20,
                    color: isActive ? '#60A5FA' : '#94A3B8',
                    transition: 'color 0.15s',
                  }}
                />
                <Typography
                  sx={{
                    color: isActive ? '#F1F5F9' : '#94A3B8',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.875rem',
                    transition: 'color 0.15s',
                  }}
                >
                  {label}
                </Typography>
                {isActive && (
                  <Box
                    sx={{
                      ml: 'auto',
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: '#3B82F6',
                    }}
                  />
                )}
              </Box>
            </Link>
          );
        })}
      </Box>

      {/* User + logout */}
      <Box sx={{ px: 2, py: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {perfil && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, px: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, backgroundColor: '#2563EB', fontSize: '0.75rem', fontWeight: 700 }}>
              {perfil.nombre?.[0]?.toUpperCase() ?? '?'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: '#E2E8F0', fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {perfil.nombre}
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '0.65rem', textTransform: 'capitalize' }}>
                {perfil.rol?.replace('_', ' ')}
              </Typography>
            </Box>
          </Box>
        )}
        {perfil?.rol === 'super_admin' && (
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, borderRadius: '8px', cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } }}>
              <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
              <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>Panel admin</Typography>
            </Box>
          </Link>
        )}
        <Box
          onClick={cerrarSesion}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, borderRadius: '8px', cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } }}
        >
          <LogoutIcon sx={{ fontSize: 18, color: '#475569' }} />
          <Typography sx={{ color: '#475569', fontSize: '0.8rem' }}>Cerrar sesión</Typography>
        </Box>
      </Box>
    </Box>
  );
}
