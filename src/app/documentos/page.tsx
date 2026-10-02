'use client';

import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import Listado from '@/components/ui/Listado';
import Fila, { editar, eliminar } from '@/components/ui/Fila';
import Etiqueta from '@/components/ui/Etiqueta';
import DialogoEliminar from '@/components/ui/DialogoEliminar';
import { useEliminar } from '@/hooks/useEliminar';
import { useDocumentos } from '@/hooks/useDocumentos';
import type { Documento, TipoDocumento } from '@/lib/types';

const TIPOS: Record<TipoDocumento, { label: string; tono: string }> = {
  consentimiento: { label: 'Consentimiento', tono: 'var(--sun)' },
  informacion:    { label: 'Información',    tono: 'var(--mint)' },
  protocolo:      { label: 'Protocolo',      tono: 'var(--lila)' },
  formulario:     { label: 'Formulario',     tono: 'var(--mint)' },
  otro:           { label: 'Otro',           tono: 'var(--bg)' },
};

export default function DocumentosPage() {
  const { documentos, cargando, error, recargar } = useDocumentos();
  const eliminacion = useEliminar<Documento>((d) => `/api/documentos/${d.id}`, recargar);

  return (
    <Listado
      titulo="Documentos"
      volver="/mas"
      nuevo={{ label: 'Documento', href: '/documentos/nuevo' }}
      items={documentos}
      cargando={cargando}
      error={error}
      buscar={{ ayuda: 'Título o etiqueta', en: (d) => [d.titulo, d.descripcion, ...(d.etiquetas ?? [])] }}
      filtro={{
        nombre: 'Tipo',
        opciones: (Object.keys(TIPOS) as TipoDocumento[]).map((valor) => ({ valor, label: TIPOS[valor].label })),
        de: (d) => d.tipo,
      }}
      vacio={{ titulo: 'Sin documentos', descripcion: 'Cargá un consentimiento o un protocolo.', icono: <DescriptionRoundedIcon fontSize="inherit" /> }}
      fila={(d, i) => (
        <Fila
          key={d.id}
          orden={i}
          icono={<DescriptionRoundedIcon />}
          tono={TIPOS[d.tipo].tono}
          titulo={d.titulo}
          detalle={TIPOS[d.tipo].label}
          etiquetas={
            <>
              {d.etiquetas?.slice(0, 2).map((e) => <Etiqueta key={e}>{e}</Etiqueta>)}
              {!d.activo && <Etiqueta>Inactivo</Etiqueta>}
            </>
          }
          href={`/documentos/${d.id}`}
          acciones={[editar(`/documentos/${d.id}/editar`), eliminar(() => eliminacion.pedir(d))]}
        />
      )}
    >
      <DialogoEliminar eliminacion={eliminacion} que="documento" nombre={(d) => d.titulo} />
    </Listado>
  );
}
