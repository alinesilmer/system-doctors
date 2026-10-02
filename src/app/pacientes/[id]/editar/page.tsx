'use client';

import { use } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import FormularioPaciente from '@/components/pacientes/FormularioPaciente';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Alert from '@mui/material/Alert';
import { usePaciente } from '@/hooks/usePacientes';
import { datosEditables } from '@/lib/entidad';

export default function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { paciente, cargando, error } = usePaciente(id);

  if (cargando) return <PageContainer volver={`/pacientes/${id}`} titulo="Editar Paciente"><LoadingScreen /></PageContainer>;
  if (error || !paciente) return (
    <PageContainer volver={`/pacientes/${id}`} titulo="Editar Paciente">
      <Alert severity="error">{error ?? 'Paciente no encontrado'}</Alert>
    </PageContainer>
  );

  const inicial = datosEditables(paciente);

  return (
    <PageContainer volver={`/pacientes/${id}`}
      titulo={`Editar: ${paciente.nombre} ${paciente.apellido}`}
      subtitulo={`DNI: ${paciente.dni}`}
    >
      <FormularioPaciente modo="editar" pacienteId={id} inicial={inicial} />
    </PageContainer>
  );
}
