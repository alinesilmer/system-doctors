const WA_API = 'https://graph.facebook.com/v21.0';

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
    return res.ok;
  } catch {
    return false;
  }
}

export function normalizarTelefono(raw: string): string {
  return raw.replace('whatsapp:', '').trim();
}
