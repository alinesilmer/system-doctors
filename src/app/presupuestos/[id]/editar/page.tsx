'use client';

import { use } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import FormularioPresupuesto from '@/components/presupuestos/FormularioPresupuesto';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Alert from '@mui/material/Alert';
import { usePresupuesto } from '@/hooks/usePresupuestos';

export default function EditarPresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { presupuesto, cargando, error } = usePresupuesto(id);

  if (cargando) return <LoadingScreen mensaje="Cargando presupuesto..." />;
  if (error || !presupuesto) return <Alert severity="error">{error ?? 'Presupuesto no encontrado'}</Alert>;

  return (
    <PageContainer volver="/presupuestos" titulo="Editar presupuesto" subtitulo={presupuesto.pacienteNombre ?? 'Sin paciente asignado'}>
      <FormularioPresupuesto modo="editar" inicial={presupuesto} />
    </PageContainer>
  );
}
