'use client';

import PageContainer from '@/components/ui/PageContainer';
import FormularioTratamiento from '@/components/tratamientos/FormularioTratamiento';

export default function NuevoTratamientoPage() {
  return (
    <PageContainer volver="/tratamientos" titulo="Nuevo tratamiento">
      <FormularioTratamiento modo="crear" />
    </PageContainer>
  );
}
