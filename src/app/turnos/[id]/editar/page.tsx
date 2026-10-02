'use client';

import { use, Suspense } from 'react';
import { useRecurso } from '@/hooks/useRecurso';
import PageContainer from '@/components/ui/PageContainer';
import FormularioTurno from '@/components/turnos/FormularioTurno';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Alert from '@mui/material/Alert';
import type { Turno } from '@/lib/types';
import { datosEditables } from '@/lib/entidad';

export default function EditarTurnoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { dato: turno, cargando, error } = useRecurso<Turno>(`/api/turnos/${id}`, 'Turno no encontrado');

  if (cargando) return <PageContainer volver="/turnos" titulo="Editar turno"><LoadingScreen /></PageContainer>;
  if (error || !turno) return (
    <PageContainer volver="/turnos" titulo="Editar turno">
      <Alert severity="error">{error ?? 'Turno no encontrado'}</Alert>
    </PageContainer>
  );

  const inicial = datosEditables(turno);

  return (
    <PageContainer volver="/turnos" titulo="Editar turno" subtitulo={`${turno.pacienteNombre ?? ''} — ${turno.fecha}`}>
      <Suspense fallback={<LoadingScreen />}>
        <FormularioTurno modo="editar" turnoId={id} inicial={inicial} />
      </Suspense>
    </PageContainer>
  );
}
