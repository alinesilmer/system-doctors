'use client';

import ConfirmarDialogo from './ConfirmarDialogo';

/** Lo que devuelve `useEliminar`, que es todo lo que el diálogo necesita. */
interface Eliminacion<T> {
  objetivo: T | null;
  eliminando: boolean;
  error: string | null;
  confirmar: () => void;
  cancelar: () => void;
}

interface Props<T> {
  eliminacion: Eliminacion<T>;
  /** Qué se elimina, en una palabra: "paciente", "turno". */
  que: string;
  /** Nombre del registro elegido, para que quede claro cuál se borra. */
  nombre?: (objetivo: T) => string;
}

/** Confirmación de borrado conectada a `useEliminar`; igual en todos los listados. */
export default function DialogoEliminar<T>({ eliminacion, que, nombre }: Props<T>) {
  const cual = eliminacion.objetivo && nombre ? `"${nombre(eliminacion.objetivo)}"` : `este ${que}`;

  return (
    <ConfirmarDialogo
      abierto={!!eliminacion.objetivo}
      titulo={`Eliminar ${que}`}
      descripcion={`¿Eliminar ${cual}? No se puede deshacer.`}
      textoConfirmar="Eliminar"
      cargando={eliminacion.eliminando}
      error={eliminacion.error}
      onConfirmar={eliminacion.confirmar}
      onCancelar={eliminacion.cancelar}
    />
  );
}
