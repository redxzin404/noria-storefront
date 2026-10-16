import type { MetadataRoute } from 'next';

import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NORIA_APP_URL;
  if (!appUrl) {
    return [];
  }
  const origin = new URL(appUrl).origin;

  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  return [
    {
      url: origin,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: new URL('/catalog', origin).toString(),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: new URL('/about', origin).toString(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...products.map((product) => ({
      url: new URL(`/product/${encodeURIComponent(product.slug)}`, origin).toString(),
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
