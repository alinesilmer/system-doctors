'use client';

import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import type { Paciente } from '@/lib/types';

interface Mensaje {
  role: 'user' | 'assistant';
  content: string;
  esNota?: boolean;
}

interface Props {
  paciente: Paciente;
  onGuardarNota: (nota: { titulo: string; contenido: string }) => void;
}

const SUGERENCIAS = [
  'Dictame la nota de esta consulta',
  '¿Cuáles son los diagnósticos diferenciales para estos síntomas?',
  'Genera un resumen de historia clínica',
  'Sugiere tratamiento para…',
];

function limpiarMarcadores(texto: string) {
  return texto.replace('[NOTA_LISTA]', '').trim();
}

function extraerTituloNota(texto: string): string {
  const match = texto.match(/\*\*Diagnóstico presuntivo:\*\*\s*([^\n]+)/i);
  if (match) return `Consulta — ${match[1].trim()}`;
  return 'Nota clínica generada por IA';
}

interface ISpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string }; isFinal: boolean; length: number }; length: number };
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export default function ChatIA({ paciente, onGuardarNota }: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grabando, setGrabando] = useState(false);
  const [transcripcionParcial, setTranscripcionParcial] = useState('');
  const [vozDisponible, setVozDisponible] = useState(false);
  const reconocimientoRef = useRef<ISpeechRecognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setVozDisponible(!!SR);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes, cargando]);

  const contexto = `Paciente: ${paciente.nombre} ${paciente.apellido}, ${
    paciente.fechaNacimiento ? `nacido/a el ${paciente.fechaNacimiento},` : ''
  } sexo ${paciente.sexo}. ${paciente.alergias ? `Alergias: ${paciente.alergias}.` : ''} ${
    paciente.obraSocial ? `Cobertura: ${paciente.obraSocial}.` : ''
  }`;

  async function enviar(texto: string) {
    if (!texto.trim() || cargando) return;
    const nuevosMensajes: Mensaje[] = [...mensajes, { role: 'user', content: texto }];
    setMensajes(nuevosMensajes);
    setInput('');
    setCargando(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: nuevosMensajes, contexto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido');
      setMensajes((prev) => [
        ...prev,
        { role: 'assistant', content: limpiarMarcadores(data.respuesta), esNota: data.esNota },
      ]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  function iniciarVoz() {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = 'es-AR';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => setGrabando(true);
    rec.onend = () => {
      setGrabando(false);
      setTranscripcionParcial('');
    };
    rec.onresult = (event: ISpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (event.results[event.results.length - 1].isFinal) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setTranscripcionParcial('');
      } else {
        setTranscripcionParcial(transcript);
      }
    };
    rec.onerror = () => setGrabando(false);

    reconocimientoRef.current = rec;
    rec.start();
  }

  function detenerVoz() {
    reconocimientoRef.current?.stop();
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
        <SmartToyOutlinedIcon sx={{ color: '#7C3AED', fontSize: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
          Asistente IA
        </Typography>
        <Chip label="Gemini 1.5 Flash · gratuito" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', backgroundColor: '#F3F0FF', color: '#7C3AED' }} />
      </Box>

      {/* Messages */}
      <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {mensajes.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4, textAlign: 'center' }}>
            <SmartToyOutlinedIcon sx={{ fontSize: 40, color: '#C4B5FD' }} />
            <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 300 }}>
              Dictá una consulta, describí síntomas o pedile al asistente que genere una nota clínica.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: 'center' }}>
              {SUGERENCIAS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  variant="outlined"
                  onClick={() => enviar(s)}
                  sx={{ cursor: 'pointer', fontSize: '0.7rem', '&:hover': { backgroundColor: '#F3F0FF', borderColor: '#7C3AED', color: '#7C3AED' } }}
                />
              ))}
            </Box>
          </Box>
        )}

        {mensajes.map((m, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              backgroundColor: m.role === 'user' ? '#2563EB' : '#7C3AED',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {m.role === 'user'
                ? <PersonOutlineIcon sx={{ fontSize: 16, color: '#fff' }} />
                : <SmartToyOutlinedIcon sx={{ fontSize: 16, color: '#fff' }} />
              }
            </Box>
            <Box sx={{ maxWidth: '85%' }}>
              <Box sx={{
                px: 1.5, py: 1,
                backgroundColor: m.role === 'user' ? '#EFF6FF' : '#FAFAFA',
                border: `1px solid ${m.role === 'user' ? '#BFDBFE' : '#E2E8F0'}`,
                borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
              }}>
                <Typography variant="body2" sx={{ color: '#1E293B', whiteSpace: 'pre-wrap', lineHeight: 1.65, fontSize: '0.82rem' }}>
                  {m.content}
                </Typography>
              </Box>
              {m.esNota && (
                <Button
                  size="small"
                  startIcon={<NoteAddOutlinedIcon />}
                  variant="contained"
                  sx={{ mt: 0.75, backgroundColor: '#7C3AED', '&:hover': { backgroundColor: '#6D28D9' }, fontSize: '0.72rem' }}
                  onClick={() => onGuardarNota({ titulo: extraerTituloNota(m.content), contenido: m.content })}
                >
                  Agregar a historia clínica
                </Button>
              )}
            </Box>
          </Box>
        ))}

        {cargando && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SmartToyOutlinedIcon sx={{ fontSize: 16, color: '#fff' }} />
            </Box>
            <Box sx={{ px: 1.5, py: 1, backgroundColor: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '4px 12px 12px 12px', display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <CircularProgress size={12} sx={{ color: '#7C3AED' }} />
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Pensando…</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mx: 2, mb: 1 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Input */}
      <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #E2E8F0', backgroundColor: '#FAFAFA' }}>
        {transcripcionParcial && (
          <Typography variant="caption" sx={{ color: '#7C3AED', display: 'block', mb: 0.75, fontStyle: 'italic' }}>
            🎙 {transcripcionParcial}…
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Escribí o dictá la consulta…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviar(input);
              }
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, backgroundColor: '#fff' } }}
          />
          {vozDisponible && (
            <Tooltip title={grabando ? 'Detener grabación' : 'Grabar voz (español)'}>
              <IconButton
                onClick={grabando ? detenerVoz : iniciarVoz}
                sx={{
                  color: grabando ? '#EF4444' : '#7C3AED',
                  backgroundColor: grabando ? '#FEE2E2' : '#F3F0FF',
                  '&:hover': { backgroundColor: grabando ? '#FECACA' : '#EDE9FE' },
                  animation: grabando ? 'pulse 1.5s infinite' : 'none',
                  '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
                }}
              >
                {grabando ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            onClick={() => enviar(input)}
            disabled={!input.trim() || cargando}
            sx={{ color: '#fff', backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' }, '&:disabled': { backgroundColor: '#E2E8F0' } }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
        {vozDisponible && (
          <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block' }}>
            Enter para enviar · Shift+Enter nueva línea · El micrófono graba en español
          </Typography>
        )}
      </Box>
    </Box>
  );
}
