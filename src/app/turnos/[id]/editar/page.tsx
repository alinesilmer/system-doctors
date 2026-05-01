'use client';

import { use, useState, useEffect, Suspense } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import FormularioTurno from '@/components/turnos/FormularioTurno';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Alert from '@mui/material/Alert';
import type { Turno } from '@/lib/types';

export default function EditarTurnoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [turno, setTurno] = useState<Turno | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/turnos/${id}`)
      .then((r) => { if (!r.ok) throw new Error('Turno no encontrado'); return r.json(); })
      .then((d) => setTurno(d.data))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <PageContainer titulo="Editar Turno"><LoadingScreen /></PageContainer>;
  if (error || !turno) return (
    <PageContainer titulo="Editar Turno">
      <Alert severity="error">{error ?? 'Turno no encontrado'}</Alert>
    </PageContainer>
  );

  const { id: _id, creadoEn: _c, actualizadoEn: _a, ...inicial } = turno;

  return (
    <PageContainer titulo="Editar Turno" subtitulo={`${turno.pacienteNombre ?? ''} — ${turno.fecha}`}>
      <Suspense fallback={<LoadingScreen />}>
        <FormularioTurno modo="editar" turnoId={id} inicial={inicial} />
      </Suspense>
    </PageContainer>
  );
}
