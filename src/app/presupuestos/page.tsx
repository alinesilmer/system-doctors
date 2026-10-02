'use client';

import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import Listado from '@/components/ui/Listado';
import Fila, { editar, eliminar } from '@/components/ui/Fila';
import Etiqueta from '@/components/ui/Etiqueta';
import DialogoEliminar from '@/components/ui/DialogoEliminar';
import { ESTADOS, ESTADOS_LISTA } from '@/components/presupuestos/config';
import { useEliminar } from '@/hooks/useEliminar';
import { usePresupuestos } from '@/hooks/usePresupuestos';
import { fechaCorta } from '@/lib/fechas';
import { formatPrecio } from '@/lib/formato';
import type { Presupuesto } from '@/lib/types';

const nombreDe = (p: Presupuesto) => p.pacienteNombre ?? 'Sin paciente';

export default function PresupuestosPage() {
  const { presupuestos, cargando, error, recargar } = usePresupuestos();
  const eliminacion = useEliminar<Presupuesto>((p) => `/api/presupuestos/${p.id}`, recargar);

  return (
    <Listado
      titulo="Presupuestos"
      volver="/mas"
      nuevo={{ label: 'Presupuesto', href: '/presupuestos/nuevo' }}
      items={presupuestos}
      cargando={cargando}
      error={error}
      buscar={{ ayuda: 'Paciente o número', en: (p) => [p.pacienteNombre, p.numero, p.notas] }}
      filtro={{
        nombre: 'Estado',
        opciones: ESTADOS_LISTA.map(({ value, label }) => ({ valor: value, label })),
        de: (p) => p.estado,
      }}
      vacio={{ titulo: 'Sin presupuestos', descripcion: 'Armá el primero.', icono: <ReceiptLongRoundedIcon fontSize="inherit" /> }}
      fila={(p, i) => (
        <Fila
          key={p.id}
          orden={i}
          icono={<ReceiptLongRoundedIcon />}
          tono="var(--sun)"
          titulo={nombreDe(p)}
          detalle={[
            p.items.length === 1 ? '1 ítem' : `${p.items.length} ítems`,
            p.validoHasta ? `vence ${fechaCorta(p.validoHasta)}` : fechaCorta(p.creadoEn),
          ].join(' · ')}
          etiquetas={<Etiqueta tono={ESTADOS[p.estado].tono}>{ESTADOS[p.estado].label}</Etiqueta>}
          valor={formatPrecio(p.total)}
          href={`/presupuestos/${p.id}`}
          acciones={[editar(`/presupuestos/${p.id}/editar`), eliminar(() => eliminacion.pedir(p))]}
        />
      )}
    >
      <DialogoEliminar eliminacion={eliminacion} que="presupuesto" nombre={nombreDe} />
    </Listado>
  );
}
