import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NORIA_APP_URL;
  const sitemap = appUrl ? new URL('/sitemap.xml', appUrl).toString() : undefined;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api',
        '/account',
        '/cart',
        '/checkout',
        '/favorites',
        '/login',
        '/signup',
        '/order',
      ],
    },
    ...(sitemap ? { sitemap } : {}),
  };
}
