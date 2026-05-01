'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCountFromServer, collection } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { getUsuarios, type UsuarioPerfil } from '@/lib/firestore/usuarios';
import { useAuth } from '@/contexts/AuthContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface Stats {
  pacientes: number;
  turnos: number;
  stock: number;
  mensajes: number;
  usuarios: number;
}

const ROL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  super_admin: { label: 'Super Admin', color: '#7C3AED', bg: '#F3F0FF' },
  admin:       { label: 'Admin',       color: '#1E40AF', bg: '#DBEAFE' },
  medico:      { label: 'Médico',      color: '#065F46', bg: '#D1FAE5' },
  secretaria:  { label: 'Secretaría',  color: '#92400E', bg: '#FEF3C7' },
};

async function contarColeccion(nombre: string): Promise<number> {
  try {
    const snap = await getCountFromServer(collection(getFirebaseDb(), nombre));
    return snap.data().count;
  } catch { return 0; }
}

export default function AdminPage() {
  const router = useRouter();
  const { perfil, rol, cargando: authCargando, cerrarSesion } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioPerfil[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (authCargando) return;
    if (rol !== 'super_admin') { router.replace('/inicio'); return; }
    async function cargar() {
      const [pac, tur, sto, msg, usr, lista] = await Promise.all([
        contarColeccion('pacientes'),
        contarColeccion('turnos'),
        contarColeccion('stock'),
        contarColeccion('conversaciones_wa'),
        contarColeccion('usuarios'),
        getUsuarios(),
      ]);
      setStats({ pacientes: pac, turnos: tur, stock: sto, mensajes: msg, usuarios: usr });
      setUsuarios(lista);
      setCargando(false);
    }
    cargar();
  }, [authCargando, rol, router]);

  if (authCargando || cargando) return <LoadingScreen mensaje="Cargando panel admin..." />;
  if (rol !== 'super_admin') return null;

  const statCards = [
    { label: 'Usuarios',   value: stats?.usuarios  ?? 0, icon: PeopleAltOutlinedIcon,       color: '#7C3AED', bg: '#F3F0FF' },
    { label: 'Pacientes',  value: stats?.pacientes  ?? 0, icon: LocalHospitalOutlinedIcon,  color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Turnos',     value: stats?.turnos     ?? 0, icon: CalendarMonthOutlinedIcon,  color: '#059669', bg: '#D1FAE5' },
    { label: 'Stock items',value: stats?.stock      ?? 0, icon: InventoryOutlinedIcon,       color: '#D97706', bg: '#FEF3C7' },
    { label: 'Chats WA',   value: stats?.mensajes   ?? 0, icon: ChatOutlinedIcon,            color: '#16A34A', bg: '#F0FDF4' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC', p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #7C3AED, #9D50E0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalHospitalOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>Panel de administración</Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>MediSystem · Vista global del sistema</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            {perfil?.nombre} · <span style={{ color: '#7C3AED', fontWeight: 600 }}>Super Admin</span>
          </Typography>
          <Button size="small" variant="outlined" startIcon={<LogoutIcon />} onClick={cerrarSesion} sx={{ borderColor: '#E2E8F0', color: '#64748B' }}>
            Salir
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Este panel muestra el uso global del sistema. En producción cada cuenta tendrá su propio espacio de datos aislado.
      </Alert>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2, mb: 4 }}>
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} sx={{ p: 2.5, borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon sx={{ fontSize: 18, color }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{value.toLocaleString()}</Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>{label}</Typography>
          </Card>
        ))}
      </Box>

      {/* Users table */}
      <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F1F5F9' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>Usuarios del sistema</Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>{usuarios.length} usuarios registrados</Typography>
        </Box>

        {usuarios.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              No hay usuarios aún. Creá el primer usuario desde Firebase Console → Authentication.
            </Typography>
          </Box>
        ) : (
          usuarios.map((u, i) => {
            const cfg = ROL_CONFIG[u.rol] ?? ROL_CONFIG.medico;
            return (
              <Box key={u.uid}>
                <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Avatar sx={{ width: 36, height: 36, backgroundColor: cfg.bg, color: cfg.color, fontSize: '0.85rem', fontWeight: 700 }}>
                    {u.nombre?.[0]?.toUpperCase() ?? '?'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 160 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{u.nombre}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{u.email}</Typography>
                  </Box>
                  <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.7rem' }} />
                  <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                      {u.ultimoAcceso ? `Último acceso: ${new Date(u.ultimoAcceso).toLocaleDateString('es-AR')}` : 'Sin acceso aún'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', fontSize: '0.6rem' }}>
                      {u.uid.slice(0, 12)}…
                    </Typography>
                  </Box>
                </Box>
                {i < usuarios.length - 1 && <Divider sx={{ borderColor: '#F8FAFC' }} />}
              </Box>
            );
          })
        )}
      </Card>

      <Box sx={{ mt: 3, p: 2.5, backgroundColor: '#F1F5F9', borderRadius: 2 }}>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
          Para crear un usuario nuevo:
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
          1. Firebase Console → Authentication → Add user (email + password)<br />
          2. Firestore → colección <code>usuarios</code> → documento con el UID → campos: nombre, email, rol, cuentaId, activo: true
        </Typography>
      </Box>
    </Box>
  );
}
