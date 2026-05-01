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
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import PageContainer from '@/components/ui/PageContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { usePresupuesto } from '@/hooks/usePresupuestos';
import type { EstadoPresupuesto, TipoItemPresupuesto } from '@/lib/types';

const ESTADOS: Record<EstadoPresupuesto, { label: string; color: string; bg: string }> = {
  borrador:  { label: 'Borrador',  color: '#92400E', bg: '#FEF3C7' },
  enviado:   { label: 'Enviado',   color: '#1D4ED8', bg: '#DBEAFE' },
  aceptado:  { label: 'Aceptado',  color: '#065F46', bg: '#D1FAE5' },
  rechazado: { label: 'Rechazado', color: '#991B1B', bg: '#FEE2E2' },
  vencido:   { label: 'Vencido',   color: '#475569', bg: '#F1F5F9' },
};

const TIPO_ICONS: Record<TipoItemPresupuesto, React.ReactNode> = {
  practica:       <LocalHospitalOutlinedIcon sx={{ fontSize: 16 }} />,
  tratamiento:    <MedicalServicesOutlinedIcon sx={{ fontSize: 16 }} />,
  examen_externo: <ScienceOutlinedIcon sx={{ fontSize: 16 }} />,
};

const TIPO_LABELS: Record<TipoItemPresupuesto, string> = {
  practica:       'Práctica',
  tratamiento:    'Tratamiento',
  examen_externo: 'Examen externo',
};

const TIPO_COLORS: Record<TipoItemPresupuesto, { bg: string; color: string }> = {
  practica:       { bg: '#DBEAFE', color: '#1D4ED8' },
  tratamiento:    { bg: '#EDE9FE', color: '#5B21B6' },
  examen_externo: { bg: '#FEF3C7', color: '#92400E' },
};

function formatPrecio(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function VerPresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { presupuesto, cargando, error } = usePresupuesto(id);

  if (cargando) return <LoadingScreen mensaje="Cargando presupuesto..." />;
  if (error || !presupuesto) return <Alert severity="error">{error ?? 'Presupuesto no encontrado'}</Alert>;

  const estadoStyle = ESTADOS[presupuesto.estado];

  const acciones = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.push('/presupuestos')}>
        Volver
      </Button>
      <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => router.push(`/presupuestos/${id}/editar`)}>
        Editar
      </Button>
    </Box>
  );

  return (
    <PageContainer titulo="Presupuesto" subtitulo={presupuesto.pacienteNombre ?? 'Sin paciente asignado'} acciones={acciones}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900 }}>

        {/* Cabecera */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PersonOutlinedIcon sx={{ color: '#1D4ED8', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                      {presupuesto.pacienteNombre ?? 'Sin paciente asignado'}
                    </Typography>
                    {presupuesto.numero && (
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
                        #{presupuesto.numero}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Estado</Typography>
                  <Chip
                    label={estadoStyle.label}
                    size="small"
                    sx={{ backgroundColor: estadoStyle.bg, color: estadoStyle.color, fontWeight: 700 }}
                  />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Fecha</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(presupuesto.creadoEn).toLocaleDateString('es-AR')}
                  </Typography>
                </Box>
                {presupuesto.validoHasta && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Válido hasta</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(presupuesto.validoHasta).toLocaleDateString('es-AR')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {presupuesto.notas && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#F8FAFC', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Notas
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: '#475569' }}>{presupuesto.notas}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Ítems */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
              Detalle del presupuesto
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="center">Cant.</TableCell>
                  <TableCell align="right">Precio unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {presupuesto.items.map((item, idx) => {
                  const tipoStyle = TIPO_COLORS[item.tipo];
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.nombre}</Typography>
                        {item.descripcion && (
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>{item.descripcion}</Typography>
                        )}
                        {item.profesional && (
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                            Prof.: {item.profesional}{item.institucion ? ` — ${item.institucion}` : ''}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={TIPO_ICONS[item.tipo] as React.ReactElement}
                          label={TIPO_LABELS[item.tipo]}
                          size="small"
                          sx={{ backgroundColor: tipoStyle.bg, color: tipoStyle.color, fontWeight: 600, fontSize: '0.65rem' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{item.cantidad}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{formatPrecio(item.precioUnitario)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatPrecio(item.subtotal)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 240 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>Subtotal</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrecio(presupuesto.subtotal)}</Typography>
                </Box>
                {presupuesto.descuento > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#10B981' }}>Descuento</Typography>
                    <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600 }}>
                      −{formatPrecio(presupuesto.descuento)}
                    </Typography>
                  </Box>
                )}
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>TOTAL</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563EB' }}>
                    {formatPrecio(presupuesto.total)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
}
