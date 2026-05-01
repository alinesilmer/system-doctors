'use client';

import PageContainer from '@/components/ui/PageContainer';
import FormularioPresupuesto from '@/components/presupuestos/FormularioPresupuesto';

export default function NuevoPresupuestoPage() {
  return (
    <PageContainer titulo="Nuevo presupuesto" subtitulo="Agregá tratamientos, prácticas y estudios externos">
      <FormularioPresupuesto modo="crear" />
    </PageContainer>
  );
}
