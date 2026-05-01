import { NextResponse } from 'next/server';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';

export async function GET() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  try {
    const db = getFirebaseDb();
    await getDocs(query(collection(db, 'pacientes'), limit(1)));
    return NextResponse.json({ ok: true, projectId, mensaje: 'Conexión exitosa con Firestore' });
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    return NextResponse.json({
      ok: false,
      projectId,
      codigo: err.code,
      error: err.message,
    }, { status: 500 });
  }
}
