'use client';

import { use } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import FormularioDocumento from '@/components/documentos/FormularioDocumento';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Alert from '@mui/material/Alert';
import { useDocumento } from '@/hooks/useDocumentos';

export default function EditarDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { documento, cargando, error } = useDocumento(id);

  if (cargando) return <LoadingScreen mensaje="Cargando documento..." />;
  if (error || !documento) return <Alert severity="error">{error ?? 'Documento no encontrado'}</Alert>;

  return (
    <PageContainer volver="/documentos" titulo="Editar documento" subtitulo={documento.titulo}>
      <FormularioDocumento modo="editar" inicial={documento} />
    </PageContainer>
  );
}
