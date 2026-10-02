import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { firebaseApp } from './firebase-app';

/**
 * Sube un archivo a Storage y devuelve su URL de descarga. Módulo aparte y
 * cargado bajo demanda: el SDK de Storage sólo se descarga cuando alguien sube
 * un archivo, no al abrir la ficha.
 */
export function subirArchivo(ruta: string, archivo: File, alAvanzar: (porcentaje: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const tarea = uploadBytesResumable(ref(getStorage(firebaseApp()), ruta), archivo, { contentType: archivo.type });
    tarea.on(
      'state_changed',
      (snap) => alAvanzar(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () => { getDownloadURL(tarea.snapshot.ref).then(resolve, reject); },
    );
  });
}
