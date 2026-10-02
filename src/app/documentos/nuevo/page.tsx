'use client';

import PageContainer from '@/components/ui/PageContainer';
import FormularioDocumento from '@/components/documentos/FormularioDocumento';

export default function NuevoDocumentoPage() {
  return (
    <PageContainer volver="/documentos" titulo="Nuevo documento">
      <FormularioDocumento modo="crear" />
    </PageContainer>
  );
}
