'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/firebase';
import type { DocumentoPaciente } from '@/lib/types';

export function useUploadDocument(pacienteId: string) {
  const [progreso, setProgreso] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<DocumentoPaciente | null> {
    setError(null);
    setProgreso(0);
    const id = crypto.randomUUID();
    const extension = file.name.split('.').pop() ?? 'bin';
    const storageRef = ref(
      getFirebaseStorage(),
      `patients/${pacienteId}/documents/${id}.${extension}`
    );

    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file);
      task.on(
        'state_changed',
        (snap) => setProgreso(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        (err) => {
          setError(err.message);
          setProgreso(null);
          reject(err);
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          setProgreso(null);
          resolve({
            id,
            nombre: file.name,
            url,
            tipo: file.type,
            tamanio: file.size,
            subidoEn: new Date().toISOString(),
          });
        }
      );
    });
  }

  return { upload, progreso, error };
}
