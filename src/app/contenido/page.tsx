'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { pedirApi } from '@/lib/api/cliente';
import PageContainer from '@/components/ui/PageContainer';

type Platform = 'instagram_post' | 'instagram_story' | 'whatsapp' | 'whatsapp_status';
type Tone = 'professional' | 'warm' | 'educational' | 'promotional';

interface ContenidoGenerado {
  title: string;
  caption_variants: string[];
  short_caption: string;
  story_slides: string[];
  whatsapp_versions: { short: string; medium: string; reminder: string };
  hashtags: string[];
  cta: string;
  image_prompt: string;
  compliance_notes: string[];
}

const PLATFORMS: { value: Platform; label: string; icon: React.ReactNode }[] = [
  { value: 'instagram_post', label: 'Post Instagram', icon: <InstagramIcon fontSize="small" /> },
  { value: 'instagram_story', label: 'Story Instagram', icon: <InstagramIcon fontSize="small" /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon fontSize="small" /> },
  { value: 'whatsapp_status', label: 'Estado WhatsApp', icon: <WhatsAppIcon fontSize="small" /> },
];

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: 'professional', label: 'Profesional', desc: 'Formal y técnico' },
  { value: 'warm', label: 'Cercano', desc: 'Amigable y empático' },
  { value: 'educational', label: 'Educativo', desc: 'Informativo y claro' },
  { value: 'promotional', label: 'Promocional', desc: 'Persuasivo y directo' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <Tooltip title={copied ? '¡Copiado!' : 'Copiar'}>
      <IconButton size="small" onClick={handleCopy} sx={{ color: copied ? 'var(--ok)' : 'var(--soft)' }}>
        {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}

function ContentBlock({ label, text, accent }: { label: string; text: string; accent?: string }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid var(--line)',
        backgroundColor: 'var(--bg)',
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: accent ?? 'var(--soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </Typography>
        <CopyButton text={text} />
      </Box>
      <Typography variant="body2" sx={{ color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {text}
      </Typography>
    </Box>
  );
}

function LoadingSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: 2 }} />
      ))}
    </Box>
  );
}

export default function ContenidoPage() {
  const [specialty, setSpecialty] = useState('');
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram_post');
  const [tone, setTone] = useState<Tone>('warm');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ContenidoGenerado | null>(null);
  const [tab, setTab] = useState(0);

  async function handleGenerar() {
    if (!specialty || !topic || !audience || !goal) {
      setError('Completá especialidad, tema, audiencia y objetivo');
      return;
    }
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const data = await pedirApi<{ data: ContenidoGenerado }>('/api/contenido/generar', {
        metodo: 'POST',
        cuerpo: { specialty, topic, platform, tone, audience, goal },
        mensajeError: 'Error al generar contenido',
      });
      setResultado(data.data);
      setTab(0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  const isInstagram = platform.startsWith('instagram');
  const isWhatsApp = platform.startsWith('whatsapp');

  return (
    <PageContainer volver="/mas"
      titulo="Contenido IA"
    >
      <Grid container spacing={2.5}>
        {/* Form */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: 3, position: { lg: 'sticky' }, top: { lg: 24 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <AutoAwesomeIcon sx={{ color: 'var(--ink)', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--ink)' }}>
                Configurar contenido
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Especialidad médica *"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ej: Cardiología, Pediatría, Odontología…"
                fullWidth
              />

              <TextField
                label="Tema del contenido *"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Prevención de hipertensión, Cuidado dental en niños…"
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="Plataforma"
                select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                fullWidth
              >
                {PLATFORMS.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {p.icon}
                      {p.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {/* Tone selector */}
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--soft)', fontWeight: 600, mb: 1, display: 'block' }}>
                  Tono
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {TONES.map((t) => (
                    <Box
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: tone === t.value ? 'var(--ink)' : 'var(--line)',
                        backgroundColor: tone === t.value ? 'var(--lila)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: 'var(--lila)' },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: tone === t.value ? 700 : 500, color: tone === t.value ? 'var(--ink)' : 'var(--ink)' }}>
                        {t.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--soft)' }}>{t.desc}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <TextField
                label="Audiencia objetivo *"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Ej: Adultos mayores de 40, padres de niños 0-12…"
                fullWidth
              />

              <TextField
                label="Objetivo del contenido *"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ej: Concientizar sobre la importancia del control anual…"
                fullWidth
                multiline
                rows={2}
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleGenerar}
                disabled={cargando}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--ink), var(--ink))',
                  '&:hover': { background: 'linear-gradient(135deg, var(--ink), var(--ink))' },
                }}
              >
                {cargando ? 'Generando...' : 'Generar contenido'}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Results */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {!resultado && !cargando && (
            <Box
              sx={{
                height: 400,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed var(--line)',
                borderRadius: 3,
                color: 'var(--soft)',
                gap: 2,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant="h6" sx={{ color: 'var(--line)' }}>
                El contenido generado aparecerá aquí
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--line)' }}>
                Completá el formulario y hacé clic en Generar
              </Typography>
            </Box>
          )}

          {cargando && (
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AutoAwesomeIcon sx={{ color: 'var(--ink)' }} />
                <Typography variant="h6" sx={{ color: 'var(--ink)', fontWeight: 700 }}>
                  Generando contenido…
                </Typography>
              </Box>
              <LoadingSkeleton />
            </Card>
          )}

          {resultado && !cargando && (
            <Card sx={{ overflow: 'hidden' }}>
              {/* Header */}
              <Box sx={{ p: 3, pb: 0, borderBottom: '1px solid var(--line)' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <AutoAwesomeIcon sx={{ color: 'var(--ink)', fontSize: 18 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--ink)' }}>
                        {resultado.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {PLATFORMS.find((p) => p.value === platform) && (
                        <Chip
                          icon={PLATFORMS.find((p) => p.value === platform)!.icon as React.ReactElement}
                          label={PLATFORMS.find((p) => p.value === platform)!.label}
                          size="small"
                          sx={{ backgroundColor: 'var(--mint)', color: 'var(--pink)' }}
                        />
                      )}
                      <Chip
                        label={TONES.find((t) => t.value === tone)?.label}
                        size="small"
                        sx={{ backgroundColor: 'var(--lila)', color: 'var(--ink)' }}
                      />
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={handleGenerar}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Regenerar
                  </Button>
                </Box>

                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' } }}
                >
                  {isInstagram && <Tab label="Captions" />}
                  {isInstagram && <Tab label="Stories" />}
                  {isWhatsApp && <Tab label="WhatsApp" />}
                  <Tab label="Hashtags & CTA" />
                  <Tab label="Visual & Compliance" />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>
                {/* Tab indexes shift based on platform */}
                {(() => {
                  const tabs: React.ReactNode[] = [];
                  let idx = 0;

                  if (isInstagram) {
                    tabs.push(
                      tab === idx++ && (
                        <Box key="captions" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {resultado.caption_variants.map((v, i) => (
                            <ContentBlock key={i} label={`Variante ${i + 1}`} text={v} accent="var(--pink)" />
                          ))}
                          <ContentBlock label="Caption corto" text={resultado.short_caption} accent="var(--pink)" />
                        </Box>
                      )
                    );
                    tabs.push(
                      tab === idx++ && (
                        <Box key="stories" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {resultado.story_slides.map((slide, i) => (
                            <ContentBlock
                              key={i}
                              label={i === resultado.story_slides.length - 1 ? 'Slide CTA' : `Slide ${i + 1}`}
                              text={slide}
                              accent={i === resultado.story_slides.length - 1 ? 'var(--ok)' : 'var(--ink)'}
                            />
                          ))}
                        </Box>
                      )
                    );
                  }

                  if (isWhatsApp) {
                    tabs.push(
                      tab === idx++ && (
                        <Box key="wa" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <ContentBlock label="Mensaje corto" text={resultado.whatsapp_versions.short} accent="var(--ok)" />
                          <ContentBlock label="Mensaje completo" text={resultado.whatsapp_versions.medium} accent="var(--ok)" />
                          <ContentBlock label="Recordatorio" text={resultado.whatsapp_versions.reminder} accent="var(--warn)" />
                        </Box>
                      )
                    );
                  }

                  tabs.push(
                    tab === idx++ && (
                      <Box key="hashtags" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="caption" sx={{ color: 'var(--soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              Hashtags
                            </Typography>
                            <CopyButton text={resultado.hashtags.join(' ')} />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                            {resultado.hashtags.map((h) => (
                              <Chip
                                key={h}
                                label={h}
                                size="small"
                                onClick={() => navigator.clipboard.writeText(h)}
                                sx={{ backgroundColor: 'var(--mint)', color: 'var(--pink)', fontWeight: 500, cursor: 'pointer', '&:hover': { backgroundColor: 'var(--mint)' } }}
                              />
                            ))}
                          </Box>
                        </Box>
                        <Divider sx={{ borderColor: 'var(--bg)' }} />
                        <ContentBlock label="Call to Action" text={resultado.cta} accent="var(--ok)" />
                      </Box>
                    )
                  );

                  tabs.push(
                    tab === idx++ && (
                      <Box key="visual" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ p: 2.5, borderRadius: 2, border: '1px solid var(--line)', backgroundColor: 'var(--bg)' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ImageOutlinedIcon sx={{ color: 'var(--ink)', fontSize: 18 }} />
                              <Typography variant="caption" sx={{ color: 'var(--ink)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Prompt para imagen IA
                              </Typography>
                            </Box>
                            <CopyButton text={resultado.image_prompt} />
                          </Box>
                          <Typography variant="body2" sx={{ color: 'var(--ink)', lineHeight: 1.7, fontStyle: 'italic' }}>
                            {resultado.image_prompt}
                          </Typography>
                        </Box>

                        {resultado.compliance_notes.length > 0 && (
                          <Box sx={{ p: 2.5, borderRadius: 2, border: '1px solid var(--sun)', backgroundColor: 'var(--sun)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                              <WarningAmberOutlinedIcon sx={{ color: 'var(--warn)', fontSize: 18 }} />
                              <Typography variant="caption" sx={{ color: 'var(--warn)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Notas de compliance
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                              {resultado.compliance_notes.map((note, i) => (
                                <Typography key={i} variant="body2" sx={{ color: 'var(--warn)', lineHeight: 1.6 }}>
                                  • {note}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )
                  );

                  return tabs;
                })()}
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>
    </PageContainer>
  );
}
