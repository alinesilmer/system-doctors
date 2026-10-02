'use client';

import { useState } from 'react';
import { MODO_DEMO } from '@/lib/demo/modo';
import type { DocumentoPaciente } from '@/lib/types';

const MAX_BYTES = 10 * 1024 * 1024;

const EXTENSIONES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function useUploadDocument(pacienteId: string) {
  const [progreso, setProgreso] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<DocumentoPaciente | null> {
    setError(null);

    // La extensión sale del tipo validado, nunca del nombre que eligió el usuario.
    const extension = EXTENSIONES[file.type];
    if (!extension) {
      setError('Formato no permitido: subí un PDF o una imagen (JPG, PNG, WEBP).');
      return null;
    }
    if (file.size > MAX_BYTES) {
      setError('El archivo supera el máximo de 10 MB.');
      return null;
    }

    setProgreso(0);
    const id = crypto.randomUUID();
    try {
      // Modo demo: el archivo no se sube; queda visible en esta pestaña hasta recargar.
      if (MODO_DEMO) {
        setProgreso(100);
        return { id, nombre: file.name, url: URL.createObjectURL(file), tipo: file.type, tamanio: file.size, subidoEn: new Date().toISOString() };
      }
      // Import dinámico: el SDK de Storage (pesado) no viaja con la página.
      const { subirArchivo } = await import('@/lib/almacenamiento');
      const url = await subirArchivo(`patients/${pacienteId}/documents/${id}.${extension}`, file, setProgreso);
      return { id, nombre: file.name, url, tipo: file.type, tamanio: file.size, subidoEn: new Date().toISOString() };
    } catch (e) {
      console.error('[upload]', e);
      setError('Error al subir el archivo. Intentá de nuevo.');
      throw e;
    } finally {
      setProgreso(null);
    }
  }

  return { upload, progreso, error };
}
