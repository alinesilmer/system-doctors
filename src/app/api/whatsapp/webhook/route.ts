import { NextResponse } from 'next/server';

// This endpoint was the Twilio webhook. It is now unused — n8n + Meta Cloud API
// replaced the Twilio integration. Kept as a placeholder returning 410 Gone.
export async function POST() {
  return NextResponse.json({ error: 'Deprecated. Use n8n + Meta Cloud API.' }, { status: 410 });
}

export async function GET() {
  return NextResponse.json({ ok: true, status: 'Twilio webhook deprecated — using Meta Cloud API via n8n.' });
}
