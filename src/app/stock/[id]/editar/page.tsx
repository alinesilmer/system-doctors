'use client';

import { use } from 'react';
import { useRecurso } from '@/hooks/useRecurso';
import PageContainer from '@/components/ui/PageContainer';
import FormularioStock from '@/components/stock/FormularioStock';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Alert from '@mui/material/Alert';
import type { ItemStock } from '@/lib/types';
import { datosEditables } from '@/lib/entidad';

export default function EditarStockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { dato: item, cargando, error } = useRecurso<ItemStock>(`/api/stock/${id}`, 'Item no encontrado');

  if (cargando) return <PageContainer volver="/stock" titulo="Editar Item"><LoadingScreen /></PageContainer>;
  if (error || !item) return (
    <PageContainer volver="/stock" titulo="Editar Item">
      <Alert severity="error">{error ?? 'Item no encontrado'}</Alert>
    </PageContainer>
  );

  const inicial = datosEditables(item);

  return (
    <PageContainer volver="/stock" titulo={`Editar: ${item.nombre}`} subtitulo={item.categoria}>
      <FormularioStock modo="editar" itemId={id} inicial={inicial} />
    </PageContainer>
  );
}
