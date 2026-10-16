import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

import { releaseExpiredInventoryReservations } from '@/lib/integrations/inventory';

function hasValidCronSecret(authorization: string | null, secret: string) {
  if (!authorization?.startsWith('Bearer ')) {
    return false;
  }

  const provided = createHash('sha256').update(authorization.slice(7)).digest();
  const expected = createHash('sha256').update(secret).digest();
  return timingSafeEqual(provided, expected);
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Maintenance endpoint is not configured.' }, { status: 503 });
  }
  if (!hasValidCronSecret(request.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const released = await releaseExpiredInventoryReservations();
    return NextResponse.json({ ok: true, released });
  } catch (error) {
    console.error('Expired inventory reservation cleanup failed:', error);
    return NextResponse.json({ error: 'Cleanup failed.' }, { status: 500 });
  }
}
