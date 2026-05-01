import { NextResponse } from 'next/server';
import { crearInvitacion, getInvitaciones } from '@/lib/firestore/invitaciones';

export async function GET() {
  try {
    const items = await getInvitaciones();
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { id, token } = await crearInvitacion();
    return NextResponse.json({ data: { id, token } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
