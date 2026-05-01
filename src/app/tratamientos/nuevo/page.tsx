'use client';

import PageContainer from '@/components/ui/PageContainer';
import FormularioTratamiento from '@/components/tratamientos/FormularioTratamiento';

export default function NuevoTratamientoPage() {
  return (
    <PageContainer titulo="Nuevo tratamiento" subtitulo="Configurá un paquete de prácticas reutilizable">
      <FormularioTratamiento modo="crear" />
    </PageContainer>
  );
}
