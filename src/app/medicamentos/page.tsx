'use client';

import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatPrecio } from '@/lib/formato';
import PageContainer from '@/components/ui/PageContainer';
import { useMedicamentos, useBusquedaMedicamentos } from '@/hooks/useMedicamentos';
import type { Medicamento, FormaFarmaceutica } from '@/lib/types';

const FORMAS: { value: FormaFarmaceutica | 'todas'; label: string }[] = [
  { value: 'todas',       label: 'Todas' },
  { value: 'comprimido',  label: 'Comprimido' },
  { value: 'capsula',     label: 'Cápsula' },
  { value: 'jarabe',      label: 'Jarabe' },
  { value: 'inyectable',  label: 'Inyectable' },
  { value: 'crema',       label: 'Crema' },
  { value: 'gotas',       label: 'Gotas' },
  { value: 'inhalador',   label: 'Inhalador' },
  { value: 'parche',      label: 'Parche' },
  { value: 'supositorio', label: 'Supositorio' },
  { value: 'otro',        label: 'Otro' },
];

const FORMA_ICONS: Partial<Record<FormaFarmaceutica, string>> = {
  comprimido: '💊', capsula: '💊', jarabe: '🧴', inyectable: '💉',
  crema: '🧴', gotas: '💧', inhalador: '🌬️', parche: '🩹',
  supositorio: '💊', otro: '💊',
};

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <Box component="mark" sx={{ backgroundColor: 'var(--sun)', borderRadius: '2px', px: '1px' }}>
        {text.slice(idx, idx + query.trim().length)}
      </Box>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

function MedCard({ med, query, onClick }: { med: Medicamento; query: string; onClick: () => void }) {
  const icono = FORMA_ICONS[med.forma] ?? '💊';
  return (
    <Card
      sx={{
        border: '1px solid var(--line)',
        boxShadow: 'none',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        '&:hover': { boxShadow: 'var(--shadow)', borderColor: 'var(--mint)' },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
          {/* Cabecera */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, wordBreak: 'break-word' }}
              >
                {highlight(med.nombre, query)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--soft)', display: 'block', mt: 0.25 }}>
                {highlight(med.principioActivo, query)}
                {med.laboratorio && ` · ${med.laboratorio}`}
              </Typography>
            </Box>
            <Box sx={{ fontSize: 22, flexShrink: 0, lineHeight: 1, mt: 0.25 }}>{icono}</Box>
          </Box>

          {/* Presentación */}
          <Typography variant="caption" sx={{ color: 'var(--soft)', backgroundColor: 'var(--bg)', borderRadius: 1, px: 1, py: 0.5, display: 'inline-block', alignSelf: 'flex-start' }}>
            {med.presentacion}
          </Typography>

          {/* Footer */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 0.5 }}>
            {med.precioSugerido ? (
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--pink)' }}>
                {formatPrecio(med.precioSugerido)}
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ color: 'var(--line)' }}>Sin precio</Typography>
            )}
            <Chip
              size="small"
              icon={med.requiereReceta ? <ReceiptOutlinedIcon sx={{ fontSize: '13px !important' }} /> : <LocalPharmacyOutlinedIcon sx={{ fontSize: '13px !important' }} />}
              label={med.requiereReceta ? 'Con receta' : 'Sin receta'}
              sx={{
                fontSize: '0.65rem',
                height: 20,
                backgroundColor: med.requiereReceta ? 'var(--sun)' : 'color-mix(in srgb, var(--ok) 18%, transparent)',
                color: med.requiereReceta ? 'var(--warn)' : 'var(--ok)',
                fontWeight: 600,
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function MedDialog({ med, onClose }: { med: Medicamento; onClose: () => void }) {
  const icono = FORMA_ICONS[med.forma] ?? '💊';
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ fontSize: 28 }}>{icono}</Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>
              {med.nombre}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--soft)' }}>
              {med.principioActivo}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12, color: 'var(--soft)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            size="small"
            label={med.presentacion}
            sx={{ backgroundColor: 'var(--bg)', color: 'var(--soft)', fontWeight: 600 }}
          />
          {med.categoria && (
            <Chip size="small" label={med.categoria} sx={{ backgroundColor: 'var(--lila)', color: 'var(--ink)', fontWeight: 600 }} />
          )}
          <Chip
            size="small"
            label={med.requiereReceta ? 'Requiere receta' : 'Sin receta'}
            sx={{
              backgroundColor: med.requiereReceta ? 'var(--sun)' : 'color-mix(in srgb, var(--ok) 18%, transparent)',
              color: med.requiereReceta ? 'var(--warn)' : 'var(--ok)',
              fontWeight: 700,
            }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Laboratorio
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)', mt: 0.25 }}>
              {med.laboratorio ?? '—'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Precio sugerido
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--pink)', mt: 0.25 }}>
              {med.precioSugerido ? formatPrecio(med.precioSugerido) : '—'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Forma farmacéutica
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)', mt: 0.25, textTransform: 'capitalize' }}>
              {med.forma}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Categoría
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)', mt: 0.25 }}>
              {med.categoria ?? '—'}
            </Typography>
          </Box>
        </Box>

        {med.disponibleEn && med.disponibleEn.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" sx={{ color: 'var(--soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
              Disponible en
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {med.disponibleEn.map((zona) => (
                <Chip key={zona} size="small" icon={<LocalPharmacyOutlinedIcon sx={{ fontSize: '13px !important' }} />} label={zona} sx={{ fontSize: '0.75rem' }} />
              ))}
            </Box>
          </>
        )}

        {med.notas && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, p: 1.5, backgroundColor: 'var(--sun)', borderRadius: 2, border: '1px solid var(--sun)' }}>
              <InfoOutlinedIcon sx={{ fontSize: 18, color: 'var(--warn)', flexShrink: 0, mt: 0.1 }} />
              <Typography variant="body2" sx={{ color: 'var(--warn)' }}>{med.notas}</Typography>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function MedicamentosPage() {
  const { medicamentos, cargando, error } = useMedicamentos();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [forma, setForma] = useState<FormaFarmaceutica | 'todas'>('todas');
  const [receta, setReceta] = useState<'todas' | 'con' | 'sin'>('todas');
  const [seleccionado, setSeleccionado] = useState<Medicamento | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 220);
    return () => clearTimeout(t);
  }, [query]);

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const resultados = useBusquedaMedicamentos(medicamentos, debouncedQuery, forma, receta);
  const haQuery = debouncedQuery.trim().length > 0 || forma !== 'todas' || receta !== 'todas';

  return (
    <PageContainer volver="/mas" titulo="Medicamentos">
      <Box sx={{ maxWidth: 960, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Search bar */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            inputRef={inputRef}
            placeholder="Buscá por nombre comercial, principio activo, laboratorio…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    {cargando
                      ? <CircularProgress size={18} thickness={3} sx={{ color: 'var(--soft)' }} />
                      : <SearchIcon sx={{ color: 'var(--soft)', fontSize: 22 }} />
                    }
                  </Box>
                ),
                endAdornment: query ? (
                  <IconButton size="small" onClick={() => setQuery('')} sx={{ color: 'var(--soft)' }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ) : null,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '1rem',
                borderRadius: '12px',
                backgroundColor: 'var(--card)',
                boxShadow: 'var(--shadow)',
                '& fieldset': { borderColor: 'var(--line)' },
                '&:hover fieldset': { borderColor: 'var(--mint)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--pink)', borderWidth: 2 },
              },
              '& .MuiOutlinedInput-input': { py: '14px' },
            }}
          />
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Forma */}
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {FORMAS.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                size="small"
                onClick={() => setForma(f.value)}
                sx={{
                  cursor: 'pointer',
                  fontWeight: forma === f.value ? 700 : 400,
                  backgroundColor: forma === f.value ? 'var(--pink)' : 'var(--bg)',
                  color: forma === f.value ? 'var(--on-accent)' : 'var(--soft)',
                  border: forma === f.value ? 'none' : '1px solid var(--line)',
                  '&:hover': { backgroundColor: forma === f.value ? 'var(--pink)' : 'var(--line)' },
                  transition: 'all 0.12s',
                }}
              />
            ))}
          </Box>

          {/* Receta toggle */}
          <Box sx={{ ml: 'auto', flexShrink: 0 }}>
            <ToggleButtonGroup
              value={receta}
              exclusive
              onChange={(_e, val) => { if (val) setReceta(val); }}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  px: 1.5,
                  py: 0.5,
                  borderColor: 'var(--line)',
                  color: 'var(--soft)',
                  '&.Mui-selected': { backgroundColor: 'var(--mint)', color: 'var(--pink)', borderColor: 'var(--mint)' },
                },
              }}
            >
              <ToggleButton value="todas">Todas</ToggleButton>
              <ToggleButton value="sin">Sin receta</ToggleButton>
              <ToggleButton value="con">Con receta</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Results */}
        {cargando ? (
          <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={36} thickness={3} />
            <Typography variant="body2" sx={{ color: 'var(--soft)' }}>Cargando medicamentos…</Typography>
          </Box>
        ) : !haQuery ? (
          <EmptySearch total={medicamentos.length} />
        ) : resultados.length === 0 ? (
          <NoResults query={debouncedQuery} onClear={() => { setQuery(''); setForma('todas'); setReceta('todas'); }} />
        ) : (
          <>
            <Typography variant="caption" sx={{ color: 'var(--soft)' }}>
              {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
              {debouncedQuery && ` para "${debouncedQuery}"`}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {resultados.map((med) => (
                <MedCard key={med.id} med={med} query={debouncedQuery} onClick={() => setSeleccionado(med)} />
              ))}
            </Box>
          </>
        )}
      </Box>

      {seleccionado && (
        <MedDialog med={seleccionado} onClose={() => setSeleccionado(null)} />
      )}
    </PageContainer>
  );
}

function EmptySearch({ total }: { total: number }) {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Box sx={{ fontSize: 56, mb: 2, opacity: 0.5 }}>
        <MedicationOutlinedIcon sx={{ fontSize: 'inherit', color: 'var(--soft)' }} />
      </Box>
      <Typography variant="h5" sx={{ color: 'var(--soft)', fontWeight: 600, mb: 1 }}>
        {total > 0 ? `${total} medicamentos disponibles` : 'Base de datos vacía'}
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--soft)', maxWidth: 360, mx: 'auto' }}>
        {total > 0
          ? 'Escribí el nombre comercial, principio activo o laboratorio para buscar'
          : 'Todavía no hay datos cargados. Próximamente podés importar tu lista de medicamentos.'
        }
      </Typography>
    </Box>
  );
}

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h5" sx={{ color: 'var(--soft)', fontWeight: 600, mb: 1 }}>
        Sin resultados para &ldquo;{query}&rdquo;
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--soft)', mb: 2 }}>
        Probá con el nombre genérico, principio activo o laboratorio
      </Typography>
      <Chip label="Limpiar búsqueda" onClick={onClear} sx={{ cursor: 'pointer' }} />
    </Box>
  );
}
