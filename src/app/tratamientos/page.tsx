'use client';

import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import Listado from '@/components/ui/Listado';
import Fila, { editar, eliminar } from '@/components/ui/Fila';
import Etiqueta from '@/components/ui/Etiqueta';
import DialogoEliminar from '@/components/ui/DialogoEliminar';
import { useEliminar } from '@/hooks/useEliminar';
import { useTratamientos } from '@/hooks/useTratamientos';
import { formatPrecio } from '@/lib/formato';
import type { Tratamiento } from '@/lib/types';

export default function TratamientosPage() {
  const { tratamientos, cargando, error, recargar } = useTratamientos();
  const eliminacion = useEliminar<Tratamiento>((t) => `/api/tratamientos/${t.id}`, recargar);

  return (
    <Listado
      titulo="Tratamientos"
      volver="/mas"
      nuevo={{ label: 'Tratamiento', href: '/tratamientos/nuevo' }}
      items={tratamientos}
      cargando={cargando}
      error={error}
      buscar={{ ayuda: 'Buscar tratamiento', en: (t) => [t.nombre, t.descripcion] }}
      vacio={{ titulo: 'Sin tratamientos', descripcion: 'Agrupá prácticas en un paquete.', icono: <ScienceRoundedIcon fontSize="inherit" /> }}
      fila={(t, i) => (
        <Fila
          key={t.id}
          orden={i}
          icono={<ScienceRoundedIcon />}
          tono="var(--mint)"
          titulo={t.nombre}
          detalle={t.practicas.length === 1 ? '1 práctica' : `${t.practicas.length} prácticas`}
          etiquetas={!t.activo && <Etiqueta>Inactivo</Etiqueta>}
          valor={formatPrecio(t.precioTotal)}
          href={`/tratamientos/${t.id}/editar`}
          acciones={[editar(`/tratamientos/${t.id}/editar`), eliminar(() => eliminacion.pedir(t))]}
        />
      )}
    >
      <DialogoEliminar eliminacion={eliminacion} que="tratamiento" nombre={(t) => t.nombre} />
    </Listado>
  );
}
