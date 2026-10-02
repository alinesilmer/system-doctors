'use client';

import PageContainer from '@/components/ui/PageContainer';
import FormularioPresupuesto from '@/components/presupuestos/FormularioPresupuesto';

export default function NuevoPresupuestoPage() {
  return (
    <PageContainer volver="/presupuestos" titulo="Nuevo presupuesto">
      <FormularioPresupuesto modo="crear" />
    </PageContainer>
  );
}
