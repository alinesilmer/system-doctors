import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

interface StatsCardProps {
  titulo: string;
  valor: string | number;
  icono: React.ReactNode;
  color?: string;
  bgColor?: string;
  tendencia?: string;
}

export default function StatsCard({ titulo, valor, icono, color = '#2563EB', bgColor = '#EFF6FF', tendencia }: StatsCardProps) {
  return (
    <Card
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color,
          fontSize: 24,
        }}
      >
        {icono}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {titulo}
        </Typography>
        <Typography
          variant="h2"
          sx={{ color: '#0F172A', mt: 0.25, lineHeight: 1 }}
        >
          {valor}
        </Typography>
        {tendencia && (
          <Typography variant="caption" sx={{ color: '#64748B', mt: 0.5 }}>
            {tendencia}
          </Typography>
        )}
      </Box>
    </Card>
  );
}
