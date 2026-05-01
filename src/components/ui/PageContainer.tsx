import Box from '@mui/material/Box';
import Header from '@/components/layout/Header';

interface PageContainerProps {
  titulo: string;
  subtitulo?: string;
  acciones?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageContainer({ titulo, subtitulo, acciones, children }: PageContainerProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header titulo={titulo} subtitulo={subtitulo} acciones={acciones} />
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }} className="page-enter">
        {children}
      </Box>
    </Box>
  );
}
