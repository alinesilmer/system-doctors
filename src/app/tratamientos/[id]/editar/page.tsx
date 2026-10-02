'use client';

import { use } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import FormularioTratamiento from '@/components/tratamientos/FormularioTratamiento';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Alert from '@mui/material/Alert';
import { useTratamiento } from '@/hooks/useTratamientos';

export default function EditarTratamientoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tratamiento, cargando, error } = useTratamiento(id);

  if (cargando) return <LoadingScreen mensaje="Cargando tratamiento..." />;
  if (error || !tratamiento) return <Alert severity="error">{error ?? 'Tratamiento no encontrado'}</Alert>;

  return (
    <PageContainer volver="/tratamientos" titulo="Editar tratamiento" subtitulo={tratamiento.nombre}>
      <FormularioTratamiento modo="editar" inicial={tratamiento} />
    </PageContainer>
  );
}
