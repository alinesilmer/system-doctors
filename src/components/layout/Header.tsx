'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

interface HeaderProps {
  titulo: string;
  subtitulo?: string;
  acciones?: React.ReactNode;
}

export default function Header({ titulo, subtitulo, acciones }: HeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        height: 'var(--header-height)',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <Box>
        <Typography variant="h3" sx={{ color: '#0F172A', mb: subtitulo ? 0 : 0 }}>
          {titulo}
        </Typography>
        {subtitulo && (
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {subtitulo}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {acciones && <Box sx={{ display: 'flex', gap: 1 }}>{acciones}</Box>}
        <Tooltip title="Notificaciones">
          <IconButton size="small" sx={{ color: '#64748B' }}>
            <NotificationsOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Mi cuenta">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: '#2563EB',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Dr
          </Avatar>
        </Tooltip>
      </Box>
    </Box>
  );
}
