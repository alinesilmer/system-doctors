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
import { ESTADOS, TIPO_COLORS, TIPO_ICONS, TIPO_LABELS } from '@/components/presupuestos/config';
import { formatPrecio } from '@/lib/formato';
import PageContainer from '@/components/ui/PageContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { usePresupuesto } from '@/hooks/usePresupuestos';

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
    <PageContainer volver="/presupuestos" titulo="Presupuesto" subtitulo={presupuesto.pacienteNombre ?? 'Sin paciente asignado'} acciones={acciones}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900 }}>

        {/* Cabecera */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PersonOutlinedIcon sx={{ color: 'var(--pink)', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>
                      {presupuesto.pacienteNombre ?? 'Sin paciente asignado'}
                    </Typography>
                    {presupuesto.numero && (
                      <Typography variant="caption" sx={{ color: 'var(--soft)', fontFamily: 'monospace' }}>
                        #{presupuesto.numero}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: 'var(--soft)', display: 'block' }}>Estado</Typography>
                  <Chip
                    label={estadoStyle.label}
                    size="small"
                    sx={{ backgroundColor: estadoStyle.bg, color: estadoStyle.color, fontWeight: 700 }}
                  />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: 'var(--soft)', display: 'block' }}>Fecha</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(presupuesto.creadoEn).toLocaleDateString('es-AR')}
                  </Typography>
                </Box>
                {presupuesto.validoHasta && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: 'var(--soft)', display: 'block' }}>Válido hasta</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(presupuesto.validoHasta).toLocaleDateString('es-AR')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {presupuesto.notas && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'var(--bg)', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'var(--soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Notas
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--soft)' }}>{presupuesto.notas}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Ítems */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--ink)', mb: 2 }}>
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
                          <Typography variant="caption" sx={{ color: 'var(--soft)' }}>{item.descripcion}</Typography>
                        )}
                        {item.profesional && (
                          <Typography variant="caption" sx={{ color: 'var(--soft)', display: 'block' }}>
                            Prof.: {item.profesional}{item.institucion ? ` — ${item.institucion}` : ''}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={TIPO_ICONS[item.tipo]}
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
                  <Typography variant="body2" sx={{ color: 'var(--soft)' }}>Subtotal</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrecio(presupuesto.subtotal)}</Typography>
                </Box>
                {presupuesto.descuento > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'var(--ok)' }}>Descuento</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--ok)', fontWeight: 600 }}>
                      −{formatPrecio(presupuesto.descuento)}
                    </Typography>
                  </Box>
                )}
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>TOTAL</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--pink)' }}>
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
