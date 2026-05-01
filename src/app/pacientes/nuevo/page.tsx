import type { Metadata } from 'next';
import PageContainer from '@/components/ui/PageContainer';
import FormularioPaciente from '@/components/pacientes/FormularioPaciente';

export const metadata: Metadata = { title: 'Nuevo Paciente' };

export default function NuevoPacientePage() {
  return (
    <PageContainer titulo="Nuevo Paciente" subtitulo="Completá los datos del paciente">
      <FormularioPaciente modo="crear" />
    </PageContainer>
  );
}
