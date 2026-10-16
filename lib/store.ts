import { prisma } from '@/lib/db';
import type { Category, Product, StoreSettings } from '@prisma/client';

export type PublicProduct = Product & {
  category: Category | null;
};

export async function getStoreSettings(): Promise<StoreSettings | null> {
  return prisma.storeSettings.findFirst();
}

export async function getCategories(): Promise<Category[]> {
  return prisma.category.findMany({ where: { active: true }, orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }] });
}

export async function getFeaturedProducts(): Promise<PublicProduct[]> {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
}

export async function getLatestProducts(): Promise<PublicProduct[]> {
  return prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function getCatalogProducts(params: {
  category?: string;
  search?: string;
  maxPrice?: number;
  minPrice?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  const take = params.pageSize ?? 8;
  const skip = ((params.page ?? 1) - 1) * take;

  const where: Record<string, unknown> = { active: true };

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { description: { contains: params.search } },
      { shortDescription: { contains: params.search } },
    ];
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {
      ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
      ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
    };
  }

  const sortMap: Record<string, Record<string, 'asc' | 'desc'>> = {
    newest: { createdAt: 'desc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    featured: { featured: 'desc' },
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: sortMap[params.sort ?? 'newest'] ?? sortMap.newest,
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: params.page ?? 1, pageSize: take };
}
