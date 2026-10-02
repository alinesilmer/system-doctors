/**
 * Modo demo: la app funciona sólo con el frontend. Las pantallas reciben datos
 * ficticios desde el navegador (`lib/demo/servidor.ts`) y la API real queda
 * cerrada, así que el deploy no necesita Firebase, Gemini ni WhatsApp.
 *
 * Se activa solo cuando no hay proyecto de Firebase configurado. Para pasar al
 * backend real alcanza con cargar las variables de entorno y volver a
 * desplegar; `NEXT_PUBLIC_MODO_DEMO=1` lo fuerza aunque las variables estén.
 */
export const MODO_DEMO =
  process.env.NEXT_PUBLIC_MODO_DEMO === '1' || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
