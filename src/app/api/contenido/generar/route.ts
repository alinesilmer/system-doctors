import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are an AI assistant specialized in generating medical marketing content for private healthcare professionals.

IMPORTANT CONTEXT:
- The user is a doctor or clinic
- Content must be professional, ethical, and compliant
- NEVER make medical promises or guarantees
- NEVER provide diagnosis
- Use clear, simple language for patients
- Tone must be trustworthy and human

INPUT:
- specialty: {{specialty}}
- topic: {{topic}}
- platform: {{platform}}
- tone: {{tone}}
- audience: {{audience}}
- goal: {{goal}}

TASK:
Generate structured content optimized for the selected platform.

OUTPUT FORMAT (STRICT JSON — no markdown, no explanation, just the JSON object):

{
  "title": "short engaging title",
  "caption_variants": [
    "version 1",
    "version 2",
    "version 3"
  ],
  "short_caption": "short version",
  "story_slides": [
    "slide 1",
    "slide 2",
    "slide 3",
    "cta slide"
  ],
  "whatsapp_versions": {
    "short": "short message",
    "medium": "medium message",
    "reminder": "reminder version"
  },
  "hashtags": ["#tag1", "#tag2"],
  "cta": "call to action",
  "image_prompt": "clean prompt for generating a professional medical visual",
  "compliance_notes": [
    "any potential risk or warning"
  ]
}

RULES:
- Keep Instagram captions under 1200 characters
- Story slides must be VERY short (1 sentence each)
- WhatsApp messages must feel personal, not robotic
- Avoid exaggerated language
- Include subtle CTA (e.g. 'consult your doctor', 'book an appointment')
- Use neutral and safe medical phrasing
- Respond ONLY with the JSON object, no extra text`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const body = await req.json();
  const { specialty, topic, platform, tone, audience, goal } = body;

  if (!specialty || !topic || !platform || !tone || !audience || !goal) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
  }

  const prompt = SYSTEM_PROMPT
    .replace('{{specialty}}', specialty)
    .replace('{{topic}}', topic)
    .replace('{{platform}}', platform)
    .replace('{{tone}}', tone)
    .replace('{{audience}}', audience)
    .replace('{{goal}}', goal);

  const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    return NextResponse.json({ error: `Gemini error: ${err}` }, { status: 500 });
  }

  const geminiData = await geminiRes.json();

  // Gemini 2.5 thinking models return multiple parts — pick the non-thinking one
  const parts: { text?: string; thought?: boolean }[] =
    geminiData?.candidates?.[0]?.content?.parts ?? [];
  const rawText: string =
    parts.find((p) => !p.thought && p.text)?.text ??
    parts.find((p) => p.text)?.text ?? '';

  // Strip markdown code fences if Gemini wraps in ```json
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ data: parsed });
  } catch {
    return NextResponse.json({ error: 'No se pudo parsear la respuesta de IA', raw: cleaned }, { status: 500 });
  }
}
