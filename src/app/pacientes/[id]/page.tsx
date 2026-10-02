'use client';

import { use, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import HealthAndSafetyRoundedIcon from '@mui/icons-material/HealthAndSafetyRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PageContainer from '@/components/ui/PageContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConfirmarDialogo from '@/components/ui/ConfirmarDialogo';
import AvatarIniciales from '@/components/ui/AvatarIniciales';
import Etiqueta, { type TonoEtiqueta } from '@/components/ui/Etiqueta';
import Pildora from '@/components/ui/Pildora';
import { EstetoscopioIcon } from '@/components/ui/iconos';
import { redondoClaro, rotulo, tarjeta } from '@/components/ui/estilos';
import HistoriaClinica from '@/components/pacientes/HistoriaClinica';
import { usePaciente } from '@/hooks/usePacientes';
import { useUploadDocument } from '@/hooks/useUploadDocument';
import { useEliminar } from '@/hooks/useEliminar';
import { pedirApi } from '@/lib/api/cliente';
import { calcularEdad } from '@/lib/fechas';
import { formatBytes } from '@/lib/formato';
import type { DocumentoPaciente } from '@/lib/types';

const HABITOS_LABELS: Record<string, string> = {
  tabaquismo: 'Tabaquismo',
  alcohol: 'Alcohol',
  sedentarismo: 'Sedentarismo',
  dieta_inadecuada: 'Dieta inadecuada',
  exceso_pantallas: 'Pantallas / sueño',
  drogas: 'Otras sustancias',
};

/** Un dato de contacto: ícono en círculo, valor en fuerte y una palabra que lo nombra. */
function Dato({ icono, valor, nombre }: { icono: React.ReactNode; valor?: string | null; nombre: string }) {
  if (!valor) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      <Box sx={{ width: '2.8rem', height: '2.8rem', flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', backgroundColor: 'var(--bg)' }}>
        {icono}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>{valor}</Box>
        <Box sx={{ color: 'var(--soft)', fontSize: '0.85rem' }}>{nombre}</Box>
      </Box>
    </Box>
  );
}

/** Un grupo de antecedentes como etiquetas; no se dibuja si está vacío. */
function Grupo({ titulo, items, tono }: { titulo: string; items?: string[]; tono: TonoEtiqueta }) {
  if (!items?.length) return null;
  return (
    <Box>
      <Box sx={{ ...rotulo, color: 'var(--soft)', mb: 1 }}>{titulo}</Box>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        {items.map((item) => <Etiqueta key={item} tono={tono}>{item}</Etiqueta>)}
      </Box>
    </Box>
  );
}

const archivo = {
  width: '8.5rem', aspectRatio: '3 / 4', p: 1, borderRadius: '1.2rem 1.2rem 1.2rem 0.4rem',
  display: 'grid', placeContent: 'center', justifyItems: 'center', gap: 0.75, textAlign: 'center',
  fontWeight: 800, fontSize: '0.8rem', textDecoration: 'none', color: 'var(--ink)', backgroundColor: 'var(--bg)',
  border: 0, cursor: 'pointer', overflowWrap: 'anywhere',
  transition: 'transform 0.25s var(--spring)',
  '&:hover': { transform: 'translateY(-5px) rotate(-2deg)' },
  '& svg': { fontSize: '2.4rem', color: 'var(--pink)' },
} as const;

export default function PerfilPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { paciente, cargando, error } = usePaciente(id);
  const [tab, setTab] = useState(0);
  const eliminacion = useEliminar<{ id: string }>((o) => `/api/pacientes/${o.id}`, () => router.push('/pacientes'));
  const [documentos, setDocumentos] = useState<DocumentoPaciente[]>([]);
  const [docError, setDocError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, progreso, error: uploadError } = useUploadDocument(id);

  // Lo recién subido manda sobre lo que trajo la ficha al cargar.
  const docsActuales = documentos.length > 0 ? documentos : (paciente?.documentos ?? []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !paciente) return;
    e.target.value = '';
    setDocError(null);
    try {
      const doc = await upload(file);
      if (!doc) return;
      const nuevos = [...docsActuales, doc];
      await pedirApi(`/api/pacientes/${id}`, { metodo: 'PUT', cuerpo: { documentos: nuevos } });
      // Recién se muestra cuando quedó asentado en la ficha.
      setDocumentos(nuevos);
    } catch {
      setDocError('No se pudo subir. Probá de nuevo.');
    }
  }

  if (cargando) return <PageContainer titulo="Ficha" volver="/pacientes"><LoadingScreen /></PageContainer>;
  if (error || !paciente) return (
    <PageContainer titulo="Ficha" volver="/pacientes">
      <Alert severity="error">{error ?? 'Paciente no encontrado'}</Alert>
    </PageContainer>
  );

  const nombre = `${paciente.nombre} ${paciente.apellido}`;
  const edad = calcularEdad(paciente.fechaNacimiento);
  const familia = [
    ...(paciente.antFamiliares?.padre ?? []).map((c) => `Padre: ${c}`),
    ...(paciente.antFamiliares?.madre ?? []).map((c) => `Madre: ${c}`),
    ...(paciente.antFamiliares?.hermanos ?? []).map((c) => `Hermanos: ${c}`),
  ];

  const acciones = (
    <>
      <Tooltip title="Editar">
        <Box component={Link} href={`/pacientes/${id}/editar`} aria-label="Editar" sx={redondoClaro}><EditRoundedIcon /></Box>
      </Tooltip>
      <Tooltip title="Eliminar">
        <Box component="button" aria-label="Eliminar" onClick={() => eliminacion.pedir({ id })} sx={{ ...redondoClaro, '&:hover': { transform: 'scale(1.1)', backgroundColor: 'var(--bad)', color: 'var(--on-accent)' } }}>
          <DeleteRoundedIcon />
        </Box>
      </Tooltip>
      <Pildora href={`/turnos/nuevo?pacienteId=${id}`}>Turno</Pildora>
    </>
  );

  return (
    <PageContainer
      titulo={nombre}
      icono={<AvatarIniciales nombre={nombre} tam={5.5} />}
      volver="/pacientes"
      acciones={acciones}
    >
      {/* Lo que hay que saber de un vistazo: la alergia primero, en el color de atención. */}
      <Box className="in" style={{ '--n': 1 } as React.CSSProperties} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {paciente.alergias && <Etiqueta tono="acento" icono={<WarningAmberRoundedIcon />}>{paciente.alergias}</Etiqueta>}
        {paciente.grupoSanguineo && <Etiqueta tono="sun">{paciente.grupoSanguineo}</Etiqueta>}
        {paciente.obraSocial && <Etiqueta tono="mint" icono={<HealthAndSafetyRoundedIcon />}>{paciente.obraSocial}</Etiqueta>}
        {edad && <Etiqueta>{edad}</Etiqueta>}
      </Box>

      <Tabs className="in" style={{ '--n': 2 } as React.CSSProperties} value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab icon={<EstetoscopioIcon />} iconPosition="start" label="Historia" />
        <Tab icon={<PersonRoundedIcon />} iconPosition="start" label="Datos" />
        <Tab icon={<DescriptionRoundedIcon />} iconPosition="start" label="Archivos" />
      </Tabs>

      <Box className="in" style={{ '--n': 3 } as React.CSSProperties} sx={{ ...tarjeta, p: { xs: 2, sm: 3 }, maxWidth: '52rem' }}>
        {tab === 0 && <HistoriaClinica pacienteId={id} paciente={paciente} />}

        {tab === 1 && (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: 2 }}>
              <Dato icono={<PhoneRoundedIcon />} valor={paciente.telefono} nombre="Teléfono" />
              <Dato icono={<MailRoundedIcon />} valor={paciente.email} nombre="Email" />
              <Dato icono={<BadgeRoundedIcon />} valor={paciente.dni} nombre="DNI" />
              <Dato icono={<CakeRoundedIcon />} valor={paciente.fechaNacimiento} nombre="Nacimiento" />
              <Dato icono={<HomeRoundedIcon />} valor={paciente.direccion} nombre="Dirección" />
              <Dato
                icono={<HealthAndSafetyRoundedIcon />}
                valor={[paciente.obraSocial, paciente.nroAfiliado].filter(Boolean).join(' · ')}
                nombre="Cobertura"
              />
            </Box>
            <Grupo titulo="Familia" items={familia} tono="lila" />
            <Grupo titulo="Cirugías" items={paciente.antPersonales?.cirugias} tono="sun" />
            <Grupo titulo="Internaciones" items={paciente.antPersonales?.internaciones} tono="sun" />
            <Grupo titulo="Hábitos" items={paciente.habitos?.items.map((h) => HABITOS_LABELS[h] ?? h)} tono="mint" />
            {paciente.notas && (
              <Box>
                <Box sx={{ ...rotulo, color: 'var(--soft)', mb: 1 }}>Notas</Box>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{paciente.notas}</Typography>
              </Box>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box>
            {(docError || uploadError) && <Alert severity="error" sx={{ mb: 2 }}>{docError ?? uploadError}</Alert>}
            {progreso !== null && <LinearProgress variant="determinate" value={progreso} sx={{ mb: 2 }} />}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {docsActuales.map((doc) => (
                <Tooltip key={doc.id} title={`${new Date(doc.subidoEn).toLocaleDateString('es-AR')}${doc.tamanio ? ` · ${formatBytes(doc.tamanio)}` : ''}`}>
                  <Box component="a" href={doc.url} target="_blank" rel="noopener noreferrer" sx={archivo}>
                    <DescriptionRoundedIcon />
                    {doc.nombre}
                  </Box>
                </Tooltip>
              ))}
              <Box
                component="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={progreso !== null}
                sx={{ ...archivo, backgroundColor: 'transparent', border: '3px dashed var(--line)', color: 'var(--soft)', '& svg': { fontSize: '2.4rem' } }}
              >
                <AddRoundedIcon />
                Subir
              </Box>
            </Box>
            <Box sx={{ color: 'var(--soft)', fontSize: '0.85rem', mt: 2 }}>PDF o imagen · 10 MB</Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Box>
        )}
      </Box>

      <ConfirmarDialogo
        abierto={!!eliminacion.objetivo}
        titulo="Eliminar paciente"
        descripcion={`¿Eliminar a ${nombre}? No se puede deshacer.`}
        textoConfirmar="Eliminar"
        cargando={eliminacion.eliminando}
        error={eliminacion.error}
        onConfirmar={eliminacion.confirmar}
        onCancelar={eliminacion.cancelar}
      />
    </PageContainer>
  );
}
