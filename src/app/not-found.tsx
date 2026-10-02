import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EmptyState from '@/components/ui/EmptyState';
import { Mascota } from '@/components/ui/Mascota';
import Pildora from '@/components/ui/Pildora';
import Box from '@mui/material/Box';

export default function NotFound() {
  return (
    <Box sx={{ minHeight: '80vh', display: 'grid', placeContent: 'center', justifyItems: 'center', px: 2 }}>
      <EmptyState titulo="Acá no hay nada" descripcion="Esa página no existe." ilustracion={<Mascota />} />
      <Pildora href="/inicio" icono={<HomeRoundedIcon />}>Inicio</Pildora>
    </Box>
  );
}
