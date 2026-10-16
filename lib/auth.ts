import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import argon2 from 'argon2';

import { prisma } from '@/lib/db';

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function verifyPassword(passwordHash: string, password: string) {
  return argon2.verify(passwordHash, password);
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set('noria_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });

  return token;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('noria_session')?.value;

  if (!token) {
    return null;
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    cookieStore.delete('noria_session');
    return null;
  }

  return session.user;
}

export async function requireAdmin() {
  const user = await getSessionUser();

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return user;
}

export async function signOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get('noria_session')?.value;

  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.session.deleteMany({ where: { tokenHash } });
  }

  cookieStore.delete('noria_session');
}
