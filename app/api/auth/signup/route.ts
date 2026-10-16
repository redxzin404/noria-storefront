import { NextResponse } from 'next/server';

import { createSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { registerSchema } from '@/lib/validation';

export async function POST(request: Request) {
  if (process.env.NORIA_DEMO_MODE === 'true') {
    return NextResponse.json(
      { error: 'O cadastro está desativado nesta demonstração.' },
      { status: 503 },
    );
  }

  try {
    const json = await request.json();
    const result = registerSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 });
    }

    const email = String(result.data.email).toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: result.data.name,
        email,
        passwordHash: await hashPassword(result.data.password),
        role: 'CUSTOMER',
      },
    });

    await createSession(user.id);

    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch {
    return NextResponse.json({ error: 'Não foi possível criar a conta.' }, { status: 500 });
  }
}
