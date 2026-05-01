'use client';

import { use, useState, useEffect } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import FormularioStock from '@/components/stock/FormularioStock';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Alert from '@mui/material/Alert';
import type { ItemStock } from '@/lib/types';

export default function EditarStockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<ItemStock | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/stock/${id}`)
      .then((r) => { if (!r.ok) throw new Error('Item no encontrado'); return r.json(); })
      .then((d) => setItem(d.data))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <PageContainer titulo="Editar Item"><LoadingScreen /></PageContainer>;
  if (error || !item) return (
    <PageContainer titulo="Editar Item">
      <Alert severity="error">{error ?? 'Item no encontrado'}</Alert>
    </PageContainer>
  );

  const { id: _id, creadoEn: _c, actualizadoEn: _a, ...inicial } = item;

  return (
    <PageContainer titulo={`Editar: ${item.nombre}`} subtitulo={item.categoria}>
      <FormularioStock modo="editar" itemId={id} inicial={inicial} />
    </PageContainer>
  );
}
