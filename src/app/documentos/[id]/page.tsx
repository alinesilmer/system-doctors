'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PageContainer from '@/components/ui/PageContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useDocumento } from '@/hooks/useDocumentos';
import type { TipoDocumento } from '@/lib/types';

const TIPO_LABELS: Record<TipoDocumento, string> = {
  consentimiento: 'Consentimiento',
  informacion: 'Información',
  protocolo: 'Protocolo',
  formulario: 'Formulario',
  otro: 'Otro',
};

const TIPO_COLORS: Record<TipoDocumento, { bg: string; color: string }> = {
  consentimiento: { bg: 'var(--mint)', color: 'var(--pink)' },
  informacion:    { bg: 'color-mix(in srgb, var(--ok) 18%, transparent)', color: 'var(--ok)' },
  protocolo:      { bg: 'var(--lila)', color: 'var(--ink)' },
  formulario:     { bg: 'var(--sun)', color: 'var(--warn)' },
  otro:           { bg: 'var(--bg)', color: 'var(--soft)' },
};

export default function VerDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { documento, cargando, error } = useDocumento(id);

  if (cargando) return <LoadingScreen mensaje="Cargando documento..." />;
  if (error || !documento) return <Alert severity="error">{error ?? 'Documento no encontrado'}</Alert>;

  const tipoStyle = TIPO_COLORS[documento.tipo];

  const acciones = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.push('/documentos')}>
        Volver
      </Button>
      <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => router.push(`/documentos/${id}/editar`)}>
        Editar
      </Button>
    </Box>
  );

  return (
    <PageContainer volver="/documentos" titulo={documento.titulo} acciones={acciones}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', mb: 2 }}>
              <Box
                sx={{
                  width: 48, height: 48, borderRadius: '12px',
                  backgroundColor: tipoStyle.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <ArticleOutlinedIcon sx={{ fontSize: 24, color: tipoStyle.color }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                  <Chip
                    label={TIPO_LABELS[documento.tipo]}
                    size="small"
                    sx={{ backgroundColor: tipoStyle.bg, color: tipoStyle.color, fontWeight: 700, fontSize: '0.7rem' }}
                  />
                  <Chip
                    label={documento.activo ? 'Activo' : 'Inactivo'}
                    size="small"
                    sx={{
                      backgroundColor: documento.activo ? 'color-mix(in srgb, var(--ok) 18%, transparent)' : 'var(--bg)',
                      color: documento.activo ? 'var(--ok)' : 'var(--soft)',
                      fontWeight: 600, fontSize: '0.7rem',
                    }}
                  />
                </Box>
                {documento.descripcion && (
                  <Typography variant="body2" sx={{ color: 'var(--soft)' }}>
                    {documento.descripcion}
                  </Typography>
                )}
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: 'var(--soft)' }}>
                  Creado el {new Date(documento.creadoEn).toLocaleDateString('es-AR')}
                </Typography>
              </Box>
            </Box>

            {documento.etiquetas && documento.etiquetas.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                {documento.etiquetas.map((e) => (
                  <Chip key={e} label={e} size="small" sx={{ fontSize: '0.7rem' }} />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--ink)', mb: 2 }}>
              Contenido
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography
              component="pre"
              sx={{
                fontFamily: 'inherit',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'var(--ink)',
                lineHeight: 1.8,
                fontSize: '0.9rem',
              }}
            >
              {documento.contenido}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
}
