'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import PageContainer from '@/components/ui/PageContainer';
import StatsCard from '@/components/ui/StatsCard';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';

const ACCESOS_RAPIDOS = [
  { label: 'Nuevo Paciente', href: '/pacientes/nuevo', color: '#2563EB' },
  { label: 'Nuevo Turno', href: '/turnos/nuevo', color: '#10B981' },
  { label: 'Registrar Stock', href: '/stock/nuevo', color: '#F59E0B' },
];

export default function DashboardPage() {
  const hoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageContainer titulo="Panel Principal" subtitulo={`Hoy es ${hoy}`}>
      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            titulo="Pacientes registrados"
            valor="—"
            icono={<PeopleAltOutlinedIcon />}
            color="#2563EB"
            bgColor="#EFF6FF"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            titulo="Turnos hoy"
            valor="—"
            icono={<TodayOutlinedIcon />}
            color="#10B981"
            bgColor="#D1FAE5"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            titulo="Turnos esta semana"
            valor="—"
            icono={<CalendarMonthOutlinedIcon />}
            color="#8B5CF6"
            bgColor="#EDE9FE"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            titulo="Items en stock"
            valor="—"
            icono={<InventoryOutlinedIcon />}
            color="#F59E0B"
            bgColor="#FEF3C7"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Accesos rápidos */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#0F172A' }}>
              Accesos rápidos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {ACCESOS_RAPIDOS.map((item) => (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{
                      justifyContent: 'flex-start',
                      borderColor: '#E2E8F0',
                      color: item.color,
                      fontWeight: 500,
                      '&:hover': { borderColor: item.color, backgroundColor: `${item.color}08` },
                    }}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Navegación a módulos */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#0F172A' }}>
              Módulos del sistema
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                {
                  href: '/pacientes',
                  titulo: 'Pacientes',
                  desc: 'Gestión de pacientes, fichas, historia clínica',
                  icono: <PeopleAltOutlinedIcon sx={{ fontSize: 22 }} />,
                  color: '#2563EB',
                  bg: '#EFF6FF',
                },
                {
                  href: '/turnos',
                  titulo: 'Turnos',
                  desc: 'Agenda, calendario y gestión de citas',
                  icono: <CalendarMonthOutlinedIcon sx={{ fontSize: 22 }} />,
                  color: '#10B981',
                  bg: '#D1FAE5',
                },
                {
                  href: '/stock',
                  titulo: 'Stock',
                  desc: 'Control de inventario y movimientos',
                  icono: <InventoryOutlinedIcon sx={{ fontSize: 22 }} />,
                  color: '#F59E0B',
                  bg: '#FEF3C7',
                },
              ].map((mod, i, arr) => (
                <Link key={mod.href} href={mod.href} style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 2,
                      px: 1,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      '&:hover': { backgroundColor: '#F8FAFC' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        backgroundColor: mod.bg,
                        color: mod.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {mod.icono}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ color: '#0F172A' }}>
                        {mod.titulo}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        {mod.desc}
                      </Typography>
                    </Box>
                    <ArrowForwardIcon sx={{ color: '#CBD5E1', fontSize: 18 }} />
                  </Box>
                  {i < arr.length - 1 && <Divider sx={{ borderColor: '#F1F5F9' }} />}
                </Link>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
