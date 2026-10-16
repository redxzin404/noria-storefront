import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    take: 12,
  });

  return NextResponse.json(products);
}
