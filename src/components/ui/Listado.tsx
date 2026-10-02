'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import PageContainer from './PageContainer';
import Buscador from './Buscador';
import Filtros, { type OpcionFiltro } from './Filtros';
import EmptyState from './EmptyState';
import LoadingScreen from './LoadingScreen';
import Pildora from './Pildora';

const TODOS = 'todos';

interface Props<T> {
  titulo: string;
  volver?: string;
  /** Acción principal: una palabra y a dónde lleva (o qué hace). */
  nuevo: { label: string; href?: string; onClick?: () => void };
  /** Otras acciones de la cabecera, a la izquierda de la principal. */
  acciones?: React.ReactNode;

  items: T[];
  cargando: boolean;
  error: string | null;

  /** Texto de ayuda del buscador y los textos de cada ítem en los que busca. */
  buscar: { ayuda: string; en: (item: T) => (string | undefined)[] };
  /** Filtro opcional por una categoría del ítem. */
  filtro?: { nombre: string; opciones: OpcionFiltro[]; de: (item: T) => string };
  /** Qué mostrar cuando todavía no hay nada cargado. */
  vacio: { titulo: string; descripcion: string; icono: React.ReactNode };

  fila: (item: T, orden: number) => React.ReactNode;
  /** Diálogos de la pantalla. */
  children?: React.ReactNode;
}

/**
 * Pantalla de listado estándar: título, acción, buscador, filtro, estados de
 * carga y vacío, y una fila por registro. Cada sección sólo declara sus datos
 * y cómo se dibuja una fila.
 */
export default function Listado<T>({
  titulo, volver, nuevo, acciones, items, cargando, error, buscar, filtro, vacio, fila, children,
}: Props<T>) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState(TODOS);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return items.filter((item) =>
      (categoria === TODOS || filtro?.de(item) === categoria) &&
      (!q || buscar.en(item).some((texto) => texto?.toLowerCase().includes(q))));
    // `buscar` y `filtro` son configuración fija de cada pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, busqueda, categoria]);

  const crear = nuevo.onClick ?? (() => { if (nuevo.href) router.push(nuevo.href); });

  return (
    <PageContainer
      titulo={titulo}
      volver={volver}
      acciones={<>{acciones}<Pildora href={nuevo.href} onClick={nuevo.onClick}>{nuevo.label}</Pildora></>}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gap: 2 }}>
        <Buscador valor={busqueda} onCambio={setBusqueda} ayuda={buscar.ayuda} cantidad={filtrados.length} />
        {filtro && (
          <Filtros
            nombre={filtro.nombre}
            opciones={[{ valor: TODOS, label: 'Todos' }, ...filtro.opciones]}
            valor={categoria}
            onCambio={setCategoria}
          />
        )}
      </Box>

      {cargando ? (
        <LoadingScreen />
      ) : items.length === 0 ? (
        <EmptyState {...vacio} accion={{ label: nuevo.label, onClick: crear }} />
      ) : filtrados.length === 0 ? (
        <EmptyState titulo="Nada con eso" icono={<SearchOffRoundedIcon fontSize="inherit" />} />
      ) : (
        <Box sx={{ display: 'grid', gap: 1.25, mt: 3 }}>
          {filtrados.map(fila)}
        </Box>
      )}

      {children}
    </PageContainer>
  );
}
