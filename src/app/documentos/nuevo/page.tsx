'use client';

import PageContainer from '@/components/ui/PageContainer';
import FormularioDocumento from '@/components/documentos/FormularioDocumento';

export default function NuevoDocumentoPage() {
  return (
    <PageContainer titulo="Nuevo documento" subtitulo="Cargá un consentimiento, protocolo o hoja de información">
      <FormularioDocumento modo="crear" />
    </PageContainer>
  );
}
