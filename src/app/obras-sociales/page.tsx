'use client';

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import SearchIcon from '@mui/icons-material/Search';
import PageContainer from '@/components/ui/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { useUserProviders, usePricing } from '@/hooks/useObrasSociales';
import type { InsuranceProvider } from '@/lib/types';

function formatPrecio(precio: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(precio);
}

export default function ObrasSocialesPage() {
  const { providers, cargando: cargandoProviders, error: errorProviders } = useUserProviders();
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider | null>(null);
  const { agreement, cargando: cargandoPricing, error: errorPricing } = usePricing(selectedProvider?.id ?? null);
  const [busqueda, setBusqueda] = useState('');

  const itemsFiltrados = useMemo(() => {
    if (!agreement?.items) return [];
    if (!busqueda.trim()) return agreement.items;
    const q = busqueda.toLowerCase();
    return agreement.items.filter(
      (item) =>
        item.codigo.toLowerCase().includes(q) ||
        item.descripcion.toLowerCase().includes(q)
    );
  }, [agreement, busqueda]);

  return (
    <PageContainer volver="/mas"
      titulo="Obras sociales"
    >
      {(errorProviders || errorPricing) && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorProviders ?? errorPricing}</Alert>
      )}

      {/* Provider selector */}
      <Card sx={{ p: 3, mb: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'var(--ink)', fontWeight: 600 }}>
          Seleccioná una obra social
        </Typography>

        {cargandoProviders ? (
          <Skeleton variant="rounded" height={56} sx={{ maxWidth: 480 }} />
        ) : (
          <Autocomplete<InsuranceProvider>
            options={providers}
            getOptionLabel={(op) => op.nombre}
            value={selectedProvider}
            onChange={(_, val) => { setSelectedProvider(val); setBusqueda(''); }}
            sx={{ maxWidth: 480 }}
            renderInput={(params) => (
              <TextField {...params} label="Obra Social / Prepaga" placeholder="Buscá por nombre…" />
            )}
            renderOption={(props, option) => {
              const { key, ...rest } = props as { key: React.Key } & React.HTMLAttributes<HTMLElement>;
              return (
                <Box component="li" key={key} {...rest}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{option.nombre}</Typography>
                    {option.codigoObraSocial && (
                      <Typography variant="caption" sx={{ color: 'var(--soft)' }}>
                        Código: {option.codigoObraSocial}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            }}
            noOptionsText="No hay obras sociales registradas"
          />
        )}

        {selectedProvider && agreement && !cargandoPricing && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label={`Vigente desde ${new Date(agreement.vigenciaDesde).toLocaleDateString('es-AR')}`}
              size="small"
              sx={{ backgroundColor: 'color-mix(in srgb, var(--ok) 18%, transparent)', color: 'var(--ok)', fontWeight: 500 }}
            />
            {agreement.vigenciaHasta && (
              <Chip
                label={`Hasta ${new Date(agreement.vigenciaHasta).toLocaleDateString('es-AR')}`}
                size="small"
                sx={{ backgroundColor: 'var(--sun)', color: 'var(--warn)', fontWeight: 500 }}
              />
            )}
            <Chip
              label={`${agreement.items.length} prestaciones`}
              size="small"
              sx={{ backgroundColor: 'var(--mint)', color: 'var(--pink)', fontWeight: 500 }}
            />
          </Box>
        )}
      </Card>

      {/* Pricing table */}
      {selectedProvider && (
        <Card sx={{ overflow: 'hidden' }}>
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              placeholder="Buscar por código o descripción…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ color: 'var(--soft)', mr: 1, fontSize: 20 }} />,
                },
              }}
              sx={{ maxWidth: 400, flex: 1 }}
              size="small"
            />
            {busqueda && (
              <Typography variant="caption" sx={{ color: 'var(--soft)', whiteSpace: 'nowrap' }}>
                {itemsFiltrados.length} resultado{itemsFiltrados.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>

          {cargandoPricing ? (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={44} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          ) : !agreement ? (
            <EmptyState
              titulo="Sin arancel registrado"
              descripcion={`No hay acuerdo de precios cargado para ${selectedProvider.nombre}`}
              icono={<MedicalServicesOutlinedIcon sx={{ fontSize: 'inherit' }} />}
            />
          ) : itemsFiltrados.length === 0 ? (
            <EmptyState
              titulo="Sin resultados"
              descripcion={`No se encontraron prestaciones para "${busqueda}"`}
              icono={<SearchIcon sx={{ fontSize: 'inherit' }} />}
            />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'var(--bg)' }}>
                    <TableCell sx={{ width: 120, fontWeight: 700, color: 'var(--soft)' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'var(--soft)' }}>Descripción</TableCell>
                    <TableCell align="right" sx={{ width: 160, fontWeight: 700, color: 'var(--soft)' }}>Precio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemsFiltrados.map((item, i) => (
                    <TableRow
                      key={`${item.codigo}-${i}`}
                      hover
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: 'var(--pink)',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {item.codigo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'var(--ink)' }}>
                          {item.descripcion}
                        </Typography>
                        {item.unidad && (
                          <Typography variant="caption" sx={{ color: 'var(--soft)' }}>
                            por {item.unidad}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: 'var(--ok)', fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatPrecio(item.precio)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {!selectedProvider && !cargandoProviders && (
        <EmptyState
          titulo="Seleccioná una obra social"
          descripcion="Elegí una obra social del selector para ver los aranceles vigentes"
          icono={<MedicalServicesOutlinedIcon sx={{ fontSize: 'inherit' }} />}
        />
      )}
    </PageContainer>
  );
}
