import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { newsletterSchema } from '@/lib/validation';

export async function POST(request: Request) {
  if (process.env.NORIA_DEMO_MODE === 'true') {
    return NextResponse.json(
      { error: 'A inscrição na newsletter está desativada nesta demonstração.' },
      { status: 503 },
    );
  }

  try {
    const json = await request.json();
    const result = newsletterSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message ?? 'E-mail inválido.' }, { status: 400 });
    }

    const email = String(result.data.email).toLowerCase();
    await prisma.newsletterSubscription.upsert({
      where: { email },
      update: { consentStatus: 'granted', consentDate: new Date(), unsubscribedAt: null },
      create: { email, consentStatus: 'granted', consentDate: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Não foi possível confirmar a inscrição.' }, { status: 500 });
  }
}
