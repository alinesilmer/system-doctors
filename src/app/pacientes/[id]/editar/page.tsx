'use client';

import { use } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import FormularioPaciente from '@/components/pacientes/FormularioPaciente';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Alert from '@mui/material/Alert';
import { usePaciente } from '@/hooks/usePacientes';

export default function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { paciente, cargando, error } = usePaciente(id);

  if (cargando) return <PageContainer titulo="Editar Paciente"><LoadingScreen /></PageContainer>;
  if (error || !paciente) return (
    <PageContainer titulo="Editar Paciente">
      <Alert severity="error">{error ?? 'Paciente no encontrado'}</Alert>
    </PageContainer>
  );

  const { id: _id, creadoEn: _c, actualizadoEn: _a, ...inicial } = paciente;

  return (
    <PageContainer
      titulo={`Editar: ${paciente.nombre} ${paciente.apellido}`}
      subtitulo={`DNI: ${paciente.dni}`}
    >
      <FormularioPaciente modo="editar" pacienteId={id} inicial={inicial} />
    </PageContainer>
  );
}
