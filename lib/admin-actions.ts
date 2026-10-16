'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getAvailabilityStatus } from '@/lib/integrations/inventory';

const productSchema = z.object({
  name: z.string().trim().min(2, 'Nome do produto obrigatório.'),
  slug: z.string().trim().min(2, 'Slug obrigatório.'),
  description: z.string().trim().min(20, 'Descrição com pelo menos 20 caracteres.'),
  shortDescription: z.string().trim().optional().default(''),
  sku: z.string().trim().min(2, 'SKU obrigatório.'),
  categoryId: z.string().trim().optional().or(z.literal('')),
  supplierId: z.string().trim().optional().or(z.literal('')),
  supplierProductReference: z.string().trim().max(160).optional().default(''),
  price: z.coerce.number().int().min(1, 'Preço deve ser maior que zero.'),
  compareAtPrice: z.coerce.number().int().min(0).optional().nullable().default(null),
  costPrice: z.coerce.number().int().min(0).optional().nullable().default(null),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  shippingWidthCm: z.coerce.number().int().min(1).max(300).optional().nullable().default(null),
  shippingHeightCm: z.coerce.number().int().min(1).max(300).optional().nullable().default(null),
  shippingLengthCm: z.coerce.number().int().min(1).max(300).optional().nullable().default(null),
  shippingWeightGrams: z.coerce.number().int().min(1).max(100000).optional().nullable().default(null),
  material: z.string().trim().optional().default(''),
  dimensions: z.string().trim().optional().default(''),
  seoTitle: z.string().trim().optional().default(''),
  seoDescription: z.string().trim().optional().default(''),
  images: z.string().default('[]'),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  trackInventory: z.boolean().default(true),
});

const categorySchema = z.object({
  name: z.string().trim().min(2, 'Nome da categoria obrigatório.'),
  slug: z.string().trim().min(2, 'Slug obrigatório.'),
  description: z.string().trim().optional().default(''),
  image: z.string().trim().optional().default(''),
  active: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

const settingsSchema = z.object({
  storeName: z.string().trim().min(2).default('NÓRIA'),
  slogan: z.string().trim().min(2).default('Sua casa, no seu ritmo.'),
  topMessage: z.string().trim().min(2).default('Design e funcionalidade para o seu dia a dia.'),
  email: z.string().trim().email('E-mail inválido.'),
  phone: z.string().trim().min(8).default('+55 (11) 3333-0000'),
  instagram: z.string().trim().optional().default(''),
  pinterest: z.string().trim().optional().default(''),
  facebook: z.string().trim().optional().default(''),
  seoTitle: z.string().trim().optional().default(''),
  seoDescription: z.string().trim().optional().default(''),
});

const supplierSchema = z.object({
  name: z.string().trim().min(2, 'Nome do fornecedor obrigatório.'),
  contactEmail: z.union([z.string().trim().email('E-mail inválido.'), z.literal('')]).optional().default(''),
  contactPhone: z.string().trim().max(40).optional().default(''),
  website: z.union([z.string().trim().url('Informe uma URL válida.'), z.literal('')]).optional().default(''),
  supplierReference: z.string().trim().max(160).optional().default(''),
  shippingRegions: z.string().trim().max(500).optional().default(''),
  processingTime: z.string().trim().max(160).optional().default(''),
  returnPolicy: z.string().trim().max(1000).optional().default(''),
  internalNotes: z.string().trim().max(2000).optional().default(''),
  active: z.boolean().default(true),
});

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

function parseImageList(value: FormDataEntryValue | null | undefined): string {
  const raw = typeof value === 'string' ? value : '';
  if (!raw.trim()) return '[]';

  const urls = raw
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 10);

  return JSON.stringify(urls);
}

async function ensureAdmin() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/login');
  }

  return admin;
}

export async function createProductAction(formData: FormData) {
  await ensureAdmin();

  const payload = productSchema.parse({
    name: formData.get('name'),
    slug: (formData.get('slug') as string | null)?.trim() || slugify(String(formData.get('name') ?? '')),
    description: formData.get('description'),
    shortDescription: formData.get('shortDescription') ?? '',
    sku: formData.get('sku'),
    categoryId: formData.get('categoryId') || undefined,
    supplierId: formData.get('supplierId') || undefined,
    supplierProductReference: formData.get('supplierProductReference') ?? '',
    price: formData.get('price') ?? 0,
    compareAtPrice: formData.get('compareAtPrice') ? Number(formData.get('compareAtPrice')) : null,
    costPrice: formData.get('costPrice') ? Number(formData.get('costPrice')) : null,
    stockQuantity: formData.get('stockQuantity') ?? 0,
    shippingWidthCm: formData.get('shippingWidthCm') ? Number(formData.get('shippingWidthCm')) : null,
    shippingHeightCm: formData.get('shippingHeightCm') ? Number(formData.get('shippingHeightCm')) : null,
    shippingLengthCm: formData.get('shippingLengthCm') ? Number(formData.get('shippingLengthCm')) : null,
    shippingWeightGrams: formData.get('shippingWeightGrams') ? Number(formData.get('shippingWeightGrams')) : null,
    material: formData.get('material') ?? '',
    dimensions: formData.get('dimensions') ?? '',
    seoTitle: formData.get('seoTitle') ?? '',
    seoDescription: formData.get('seoDescription') ?? '',
    images: parseImageList(formData.get('images')),
    active: formData.get('active') === 'on',
    featured: formData.get('featured') === 'on',
    trackInventory: formData.get('trackInventory') === 'on',
  });

  const existing = await prisma.product.findUnique({ where: { slug: payload.slug } });
  if (existing) {
    throw new Error('Já existe um produto com esse slug.');
  }

  if (payload.supplierId) {
    const supplier = await prisma.supplier.findFirst({ where: { id: payload.supplierId, active: true } });
    if (!supplier) {
      throw new Error('Selecione um fornecedor ativo.');
    }
  }

  await prisma.product.create({
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      shortDescription: payload.shortDescription || null,
      sku: payload.sku,
      categoryId: payload.categoryId || null,
      supplierId: payload.supplierId || null,
      supplierProductReference: payload.supplierProductReference || null,
      price: payload.price,
      compareAtPrice: payload.compareAtPrice,
      costPrice: payload.costPrice,
      stockQuantity: payload.stockQuantity,
      shippingWidthCm: payload.shippingWidthCm,
      shippingHeightCm: payload.shippingHeightCm,
      shippingLengthCm: payload.shippingLengthCm,
      shippingWeightGrams: payload.shippingWeightGrams,
      material: payload.material || null,
      dimensions: payload.dimensions || null,
      seoTitle: payload.seoTitle || null,
      seoDescription: payload.seoDescription || null,
      images: payload.images,
      active: payload.active,
      featured: payload.featured,
      trackInventory: payload.trackInventory,
      availabilityStatus: getAvailabilityStatus(payload.stockQuantity),
    },
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function updateProductAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) {
    throw new Error('Produto inválido.');
  }

  const payload = productSchema.parse({
    name: formData.get('name'),
    slug: (formData.get('slug') as string | null)?.trim() || slugify(String(formData.get('name') ?? '')),
    description: formData.get('description'),
    shortDescription: formData.get('shortDescription') ?? '',
    sku: formData.get('sku'),
    categoryId: formData.get('categoryId') || undefined,
    supplierId: formData.get('supplierId') || undefined,
    supplierProductReference: formData.get('supplierProductReference') ?? '',
    price: formData.get('price') ?? 0,
    compareAtPrice: formData.get('compareAtPrice') ? Number(formData.get('compareAtPrice')) : null,
    costPrice: formData.get('costPrice') ? Number(formData.get('costPrice')) : null,
    stockQuantity: formData.get('stockQuantity') ?? 0,
    shippingWidthCm: formData.get('shippingWidthCm') ? Number(formData.get('shippingWidthCm')) : null,
    shippingHeightCm: formData.get('shippingHeightCm') ? Number(formData.get('shippingHeightCm')) : null,
    shippingLengthCm: formData.get('shippingLengthCm') ? Number(formData.get('shippingLengthCm')) : null,
    shippingWeightGrams: formData.get('shippingWeightGrams') ? Number(formData.get('shippingWeightGrams')) : null,
    material: formData.get('material') ?? '',
    dimensions: formData.get('dimensions') ?? '',
    seoTitle: formData.get('seoTitle') ?? '',
    seoDescription: formData.get('seoDescription') ?? '',
    images: parseImageList(formData.get('images')),
    active: formData.get('active') === 'on',
    featured: formData.get('featured') === 'on',
    trackInventory: formData.get('trackInventory') === 'on',
  });

  const existing = await prisma.product.findFirst({
    where: {
      slug: payload.slug,
      NOT: { id },
    },
  });

  if (existing) {
    throw new Error('Já existe outro produto com esse slug.');
  }

  if (payload.supplierId) {
    const supplier = await prisma.supplier.findFirst({ where: { id: payload.supplierId, active: true } });
    if (!supplier) {
      throw new Error('Selecione um fornecedor ativo.');
    }
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      shortDescription: payload.shortDescription || null,
      sku: payload.sku,
      categoryId: payload.categoryId || null,
      supplierId: payload.supplierId || null,
      supplierProductReference: payload.supplierProductReference || null,
      price: payload.price,
      compareAtPrice: payload.compareAtPrice,
      costPrice: payload.costPrice,
      stockQuantity: payload.stockQuantity,
      shippingWidthCm: payload.shippingWidthCm,
      shippingHeightCm: payload.shippingHeightCm,
      shippingLengthCm: payload.shippingLengthCm,
      shippingWeightGrams: payload.shippingWeightGrams,
      material: payload.material || null,
      dimensions: payload.dimensions || null,
      seoTitle: payload.seoTitle || null,
      seoDescription: payload.seoDescription || null,
      images: payload.images,
      active: payload.active,
      featured: payload.featured,
      trackInventory: payload.trackInventory,
      availabilityStatus: getAvailabilityStatus(payload.stockQuantity),
      updatedAt: new Date(),
    },
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function deleteProductAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) {
    throw new Error('Produto inválido.');
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function createCategoryAction(formData: FormData) {
  await ensureAdmin();

  const payload = categorySchema.parse({
    name: formData.get('name'),
    slug: (formData.get('slug') as string | null)?.trim() || slugify(String(formData.get('name') ?? '')),
    description: formData.get('description') ?? '',
    image: formData.get('image') ?? '',
    active: formData.get('active') === 'on',
    displayOrder: formData.get('displayOrder') ?? 0,
  });

  await prisma.category.create({
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description || null,
      image: payload.image || null,
      active: payload.active,
      displayOrder: payload.displayOrder,
    },
  });

  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

export async function updateCategoryAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) {
    throw new Error('Categoria inválida.');
  }

  const payload = categorySchema.parse({
    name: formData.get('name'),
    slug: (formData.get('slug') as string | null)?.trim() || slugify(String(formData.get('name') ?? '')),
    description: formData.get('description') ?? '',
    image: formData.get('image') ?? '',
    active: formData.get('active') === 'on',
    displayOrder: formData.get('displayOrder') ?? 0,
  });

  await prisma.category.update({
    where: { id },
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description || null,
      image: payload.image || null,
      active: payload.active,
      displayOrder: payload.displayOrder,
    },
  });

  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

export async function deleteCategoryAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) {
    throw new Error('Categoria inválida.');
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

export async function updateStoreSettingsAction(formData: FormData) {
  await ensureAdmin();

  const payload = settingsSchema.parse({
    storeName: formData.get('storeName') ?? 'NÓRIA',
    slogan: formData.get('slogan') ?? 'Sua casa, no seu ritmo.',
    topMessage: formData.get('topMessage') ?? 'Design e funcionalidade para o seu dia a dia.',
    email: formData.get('email') ?? 'hello@noria.com',
    phone: formData.get('phone') ?? '+55 (11) 3333-0000',
    instagram: formData.get('instagram') ?? '',
    pinterest: formData.get('pinterest') ?? '',
    facebook: formData.get('facebook') ?? '',
    seoTitle: formData.get('seoTitle') ?? '',
    seoDescription: formData.get('seoDescription') ?? '',
  });

  const existing = await prisma.storeSettings.findFirst();

  if (existing) {
    await prisma.storeSettings.update({
      where: { id: existing.id },
      data: payload,
    });
  } else {
    await prisma.storeSettings.create({ data: payload });
  }

  revalidatePath('/admin/settings');
  redirect('/admin/settings');
}

export async function createSupplierAction(formData: FormData) {
  await ensureAdmin();

  const payload = supplierSchema.parse({
    name: formData.get('name'),
    contactEmail: formData.get('contactEmail') ?? '',
    contactPhone: formData.get('contactPhone') ?? '',
    website: formData.get('website') ?? '',
    supplierReference: formData.get('supplierReference') ?? '',
    shippingRegions: formData.get('shippingRegions') ?? '',
    processingTime: formData.get('processingTime') ?? '',
    returnPolicy: formData.get('returnPolicy') ?? '',
    internalNotes: formData.get('internalNotes') ?? '',
    active: formData.get('active') === 'on',
  });

  await prisma.supplier.create({
    data: {
      ...payload,
      contactEmail: payload.contactEmail || null,
      contactPhone: payload.contactPhone || null,
      website: payload.website || null,
      supplierReference: payload.supplierReference || null,
      shippingRegions: payload.shippingRegions || null,
      processingTime: payload.processingTime || null,
      returnPolicy: payload.returnPolicy || null,
      internalNotes: payload.internalNotes || null,
      integrationStatus: 'manual',
    },
  });

  revalidatePath('/admin/suppliers');
  redirect('/admin/suppliers');
}

export async function updateSupplierAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) {
    throw new Error('Fornecedor inválido.');
  }

  const payload = supplierSchema.parse({
    name: formData.get('name'),
    contactEmail: formData.get('contactEmail') ?? '',
    contactPhone: formData.get('contactPhone') ?? '',
    website: formData.get('website') ?? '',
    supplierReference: formData.get('supplierReference') ?? '',
    shippingRegions: formData.get('shippingRegions') ?? '',
    processingTime: formData.get('processingTime') ?? '',
    returnPolicy: formData.get('returnPolicy') ?? '',
    internalNotes: formData.get('internalNotes') ?? '',
    active: formData.get('active') === 'on',
  });

  await prisma.supplier.update({
    where: { id },
    data: {
      ...payload,
      contactEmail: payload.contactEmail || null,
      contactPhone: payload.contactPhone || null,
      website: payload.website || null,
      supplierReference: payload.supplierReference || null,
      shippingRegions: payload.shippingRegions || null,
      processingTime: payload.processingTime || null,
      returnPolicy: payload.returnPolicy || null,
      internalNotes: payload.internalNotes || null,
    },
  });

  revalidatePath('/admin/suppliers');
  redirect('/admin/suppliers');
}

export async function deleteSupplierAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) {
    throw new Error('Fornecedor inválido.');
  }

  const linkedProducts = await prisma.product.count({ where: { supplierId: id } });
  const linkedOrders = await prisma.supplierOrder.count({ where: { supplierId: id } });
  if (linkedProducts > 0 || linkedOrders > 0) {
    throw new Error('Este fornecedor está associado a produtos ou pedidos e não pode ser excluído. Desative-o para preservar o histórico.');
  }

  await prisma.supplier.delete({ where: { id } });
  revalidatePath('/admin/suppliers');
  redirect('/admin/suppliers');
}
