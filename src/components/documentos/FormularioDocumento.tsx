'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { pedirApi } from '@/lib/api/cliente';
import type { Documento, TipoDocumento } from '@/lib/types';

const TIPOS: { value: TipoDocumento; label: string }[] = [
  { value: 'consentimiento', label: 'Consentimiento informado' },
  { value: 'informacion',    label: 'Hoja de información' },
  { value: 'protocolo',      label: 'Protocolo / Procedimiento' },
  { value: 'formulario',     label: 'Formulario' },
  { value: 'otro',           label: 'Otro' },
];

const ETIQUETAS_SUGERIDAS = [
  'Cirugía', 'Anestesia', 'Menores', 'Urgencia', 'Preoperatorio',
  'Postoperatorio', 'Diagnóstico', 'Tratamiento', 'Alta', 'Derivación',
];

interface Props {
  modo: 'crear' | 'editar';
  inicial?: Documento;
}

export default function FormularioDocumento({ modo, inicial }: Props) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [tipo, setTipo] = useState<TipoDocumento>(inicial?.tipo ?? 'consentimiento');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '');
  const [contenido, setContenido] = useState(inicial?.contenido ?? '');
  const [etiquetas, setEtiquetas] = useState<string[]>(inicial?.etiquetas ?? []);
  const [activo, setActivo] = useState(inicial?.activo ?? true);

  async function handleGuardar() {
    setErrorMsg(null);
    if (!titulo.trim()) { setErrorMsg('El título es obligatorio'); return; }
    if (!contenido.trim()) { setErrorMsg('El contenido es obligatorio'); return; }

    setGuardando(true);
    try {
      const payload = { titulo: titulo.trim(), tipo, descripcion: descripcion.trim(), contenido: contenido.trim(), etiquetas, activo };
      await pedirApi(modo === 'crear' ? '/api/documentos' : `/api/documentos/${inicial!.id}`, {
        metodo: modo === 'crear' ? 'POST' : 'PATCH',
        cuerpo: payload,
        mensajeError: 'Error al guardar',
      });
      router.push('/documentos');
      router.refresh();
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900 }}>
      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <Card>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--ink)', mb: 0.5 }}>
            Información general
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
            <TextField
              label="Título del documento *"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de documento *</InputLabel>
              <Select
                label="Tipo de documento *"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoDocumento)}
              >
                {TIPOS.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Descripción breve"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Describe brevemente el propósito del documento…"
          />

          <Autocomplete
            multiple
            freeSolo
            options={ETIQUETAS_SUGERIDAS}
            value={etiquetas}
            onChange={(_e, val) => setEtiquetas(val as string[])}
            renderInput={(params) => (
              <TextField {...params} label="Etiquetas" placeholder="Agregar etiqueta…" />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option}>{option}</li>
            )}
          />

          <FormControlLabel
            control={<Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} />}
            label="Documento activo"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--ink)', mb: 2 }}>
            Contenido del documento
          </Typography>
          <TextField
            label="Contenido *"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            fullWidth
            multiline
            rows={16}
            placeholder="Escribí aquí el texto completo del documento. Podés incluir instrucciones, cláusulas, información relevante, etc."
            sx={{ fontFamily: 'monospace' }}
          />
          <Typography variant="caption" sx={{ color: 'var(--soft)', mt: 1, display: 'block' }}>
            Tip: usá saltos de línea para separar secciones. El texto se mostrará con el formato tal como lo escribís.
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/documentos')}
          disabled={guardando}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleGuardar}
          loading={guardando}
        >
          {modo === 'crear' ? 'Guardar documento' : 'Guardar cambios'}
        </Button>
      </Box>
    </Box>
  );
}
