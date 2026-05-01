import { Suspense } from 'react';
import type { Metadata } from 'next';
import PageContainer from '@/components/ui/PageContainer';
import FormularioTurno from '@/components/turnos/FormularioTurno';
import LoadingScreen from '@/components/ui/LoadingScreen';

export const metadata: Metadata = { title: 'Nuevo Turno' };

export default function NuevoTurnoPage() {
  return (
    <PageContainer titulo="Nuevo Turno" subtitulo="Agendá un nuevo turno">
      <Suspense fallback={<LoadingScreen />}>
        <FormularioTurno modo="crear" />
      </Suspense>
    </PageContainer>
  );
}
