const WA_API = 'https://graph.facebook.com/v21.0';

/** Tope de la API de WhatsApp para el cuerpo de un mensaje de texto. */
export const MAX_LARGO_MENSAJE = 4096;

export async function enviarMensajeWhatsApp(to: string, body: string): Promise<boolean> {
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
  const token = process.env.WA_ACCESS_TOKEN;
  if (!phoneNumberId || !token) return false;

  try {
    const res = await fetch(`${WA_API}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizarTelefono(to),
        type: 'text',
        text: { body },
      }),
    });
    if (!res.ok) console.error('[whatsapp] Meta respondió', res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error('[whatsapp]', e);
    return false;
  }
}

export function normalizarTelefono(raw: string): string {
  return raw.replace('whatsapp:', '').trim();
}

/**
 * Un teléfono internacional plausible. Además de validar el dato, garantiza que
 * sirve como id de documento: sin `/` ni nada que cambie la ruta en Firestore.
 */
export function esTelefonoValido(tel: string): boolean {
  return /^\+?\d{8,15}$/.test(tel);
}

/**
 * Clave de la conversación de un teléfono: sólo dígitos, que es como Meta
 * informa el remitente. Así lo que enviamos y lo que nos responden cae en el
 * mismo hilo aunque el número esté cargado con `+`, espacios o guiones.
 */
export function claveConversacion(tel: string): string {
  return normalizarTelefono(tel).replace(/\D/g, '');
}

/** Lleva un teléfono cargado en cualquier formato local a E.164 argentino. */
export function aFormatoInternacional(tel: string): string {
  const digitos = tel.replace(/\D/g, '');
  if (digitos.startsWith('54')) return `+${digitos}`;
  if (digitos.startsWith('0')) return `+54${digitos.slice(1)}`;
  return `+54${digitos}`;
}
