import type { Metadata } from 'next';
import PageContainer from '@/components/ui/PageContainer';
import FormularioStock from '@/components/stock/FormularioStock';

export const metadata: Metadata = { title: 'Nuevo Item de Stock' };

export default function NuevoStockPage() {
  return (
    <PageContainer titulo="Nuevo Item" subtitulo="Agregá un item al inventario">
      <FormularioStock modo="crear" />
    </PageContainer>
  );
}
