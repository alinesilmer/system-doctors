import { NextRequest, NextResponse } from 'next/server';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';

// Called by n8n when a message is classified as urgente or needs human escalation.
// Marks the conversation as urgent in Firestore so the inbox highlights it.
export async function POST(req: NextRequest) {
  const key = req.headers.get('x-internal-key');
  if (key !== process.env.MEDISYSTEM_INTERNAL_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      from: string;
      name?: string;
      text: string;
      intent: string;
    };

    if (!body.from) {
      return NextResponse.json({ error: 'Missing from' }, { status: 400 });
    }

    await setDoc(
      doc(getFirebaseDb(), 'conversaciones_wa', body.from),
      {
        prioridad: 'urgente',
        requiereAtencion: true,
        ultimaAlerta: serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
