import { NextResponse } from 'next/server';

import { createSession, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { loginSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = loginSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(result.data.email).toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const valid = await verifyPassword(user.passwordHash, result.data.password);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    await createSession(user.id);

    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch {
    return NextResponse.json({ error: 'Não foi possível entrar no momento.' }, { status: 500 });
  }
}
