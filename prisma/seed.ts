import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.storeSettings.upsert({
    where: { id: 'default-store' },
    update: {
      storeName: 'NÓRIA',
      slogan: 'Sua casa, no seu ritmo.',
      topMessage: 'Design e funcionalidade para o seu dia a dia.',
    },
    create: {
      id: 'default-store',
      storeName: 'NÓRIA',
      slogan: 'Sua casa, no seu ritmo.',
      topMessage: 'Design e funcionalidade para o seu dia a dia.',
      email: 'hello@noria.com',
      phone: '+55 (11) 3333-0000',
      instagram: '@noria.studio',
      pinterest: '@noria.studio',
      facebook: '@noria.studio',
    },
  });

  const categories = [
    { name: 'Decoração', slug: 'decoracao', description: 'Objetos de expressão e calor para todas as peças.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Organização', slug: 'organizacao', description: 'Soluções pensadas para um dia mais leve.', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80' },
    { name: 'Cozinha', slug: 'cozinha', description: 'Ritmo e praticidade para o lar.', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80' },
    { name: 'Iluminação', slug: 'iluminacao', description: 'Luz suave e funcional em cada ambiente.', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80' },
    { name: 'Conforto', slug: 'conforto', description: 'Pequenos momentos de bem-estar.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
  ];

  const createdCategories: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    image: string | null;
    active: boolean;
    displayOrder: number;
  }> = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: { ...category, displayOrder: createdCategories.length + 1 },
    });
    createdCategories.push(created);
  }

  const products = [
    {
      name: 'Vaso de Cerâmica Claro',
      slug: 'vaso-ceramica-claro',
      description: 'Vaso em cerâmica com acabamento delicado para receber flores secas ou leves arranjos.',
      shortDescription: 'Cerâmica leve e sofisticada para compor mesas e prateleiras.',
      sku: 'NO-DEC-101',
      categorySlug: 'decoracao',
      price: 17900,
      compareAtPrice: 22900,
      images: ['https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80'],
      variants: [{ label: 'Claro', value: 'claro' }, { label: 'Areia', value: 'areia' }],
      attributes: { material: 'Cerâmica', dimensions: '26 x 26 cm', care: 'Limpar com pano seco' },
      stockQuantity: 24,
      featured: true,
      active: true,
      availabilityStatus: 'IN_STOCK',
      material: 'Cerâmica',
      dimensions: '26 x 26 cm',
      careInstructions: 'Limpar com pano seco e suave.',
    },
    {
      name: 'Cesto de Lã Natural',
      slug: 'cesto-de-lana-natural',
      description: 'Cesto multifuncional para mantas, revistas ou peças de organização com um toque acolhedor.',
      shortDescription: 'Organização com textura natural e presença artesanal.',
      sku: 'NO-ORG-205',
      categorySlug: 'organizacao',
      price: 21900,
      compareAtPrice: 26900,
      images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
      variants: [{ label: 'Natural', value: 'natural' }, { label: 'Caramelo', value: 'caramelo' }],
      attributes: { material: 'Lã e madeira', dimensions: '42 x 30 cm' },
      stockQuantity: 18,
      featured: true,
      active: true,
      availabilityStatus: 'IN_STOCK',
      material: 'Lã e madeira',
      dimensions: '42 x 30 cm',
      careInstructions: 'Aspirar levemente e evitar contato com água.',
    },
    {
      name: 'Jogo de Taças de Vidro',
      slug: 'jogo-de-tacas-vidro',
      description: 'Conjunto para servir água, sucos e bebidas com elegância e leveza.',
      shortDescription: 'Um toque de sofisticação para a mesa do dia a dia.',
      sku: 'NO-KIT-118',
      categorySlug: 'cozinha',
      price: 15900,
      compareAtPrice: 19900,
      images: ['https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80'],
      variants: [{ label: 'Set de 4', value: '4' }, { label: 'Set de 6', value: '6' }],
      attributes: { material: 'Vidro', dimensions: '10 x 10 cm cada' },
      stockQuantity: 32,
      featured: true,
      active: true,
      availabilityStatus: 'LOW_STOCK',
      material: 'Vidro',
      dimensions: '10 x 10 cm cada',
      careInstructions: 'Lavar com água morna e detergente suave.',
    },
    {
      name: 'Candeeiro de Mesa Lino',
      slug: 'candeeiro-mesa-lino',
      description: 'Candeeiro com base em madeira e tecido, perfeito para criar ambientes mais íntimos.',
      shortDescription: 'Luz acolhedora com textura natural e presença discreta.',
      sku: 'NO-ILUM-315',
      categorySlug: 'iluminacao',
      price: 28900,
      compareAtPrice: 32900,
      images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
      variants: [{ label: 'Branco', value: 'branco' }, { label: 'Carvão', value: 'carvao' }],
      attributes: { material: 'Madeira e tecido', dimensions: '30 x 20 cm' },
      stockQuantity: 14,
      featured: false,
      active: true,
      availabilityStatus: 'IN_STOCK',
      material: 'Madeira e tecido',
      dimensions: '30 x 20 cm',
      careInstructions: 'Evite o contato direto com água.',
    },
    {
      name: 'Almofada de Algodão',
      slug: 'almofada-algodao',
      description: 'Almofada com textura suave e encaixe discreto para sofás e cadeiras de leitura.',
      shortDescription: 'Conforto e estilo para cada espaço de descanso.',
      sku: 'NO-CONF-204',
      categorySlug: 'conforto',
      price: 12900,
      compareAtPrice: 16900,
      images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
      variants: [{ label: 'Fumo', value: 'fumo' }, { label: 'Oliva', value: 'oliva' }],
      attributes: { material: 'Algodão', dimensions: '45 x 45 cm' },
      stockQuantity: 28,
      featured: true,
      active: true,
      availabilityStatus: 'IN_STOCK',
      material: 'Algodão',
      dimensions: '45 x 45 cm',
      careInstructions: 'Lavar à mão com água fria.',
    },
  ];

  for (const product of products) {
    const { categorySlug, ...productData } = product;
    const category = createdCategories.find((entry) => entry.slug === categorySlug);

    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        ...productData,
        categoryId: category?.id,
        images: JSON.stringify(productData.images),
        variants: JSON.stringify(productData.variants),
        attributes: productData.attributes ? JSON.stringify(productData.attributes) : null,
        active: true,
      },
      create: {
        ...productData,
        categoryId: category?.id,
        images: JSON.stringify(productData.images),
        variants: JSON.stringify(productData.variants),
        attributes: productData.attributes ? JSON.stringify(productData.attributes) : null,
        active: true,
      },
    });
  }

  const adminEmail = process.env.NORIA_DEMO_MODE === 'true' ? undefined : process.env.ADMIN_EMAIL;
  const adminPassword = process.env.NORIA_DEMO_MODE === 'true' ? undefined : process.env.ADMIN_PASSWORD;
  if (Boolean(adminEmail) !== Boolean(adminPassword)) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must either both be set or both be omitted.');
  }

  if (adminEmail && adminPassword) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: 'ADMIN' },
      create: {
        name: 'Administrador NÓRIA',
        email: adminEmail,
        passwordHash: await argon2.hash(adminPassword),
        role: 'ADMIN',
      },
    });
    console.log(`Seed configured with ${settings.storeName}. Admin: ${adminEmail}`);
  } else {
    console.log(`Seed configured with ${settings.storeName}. No administrator was created.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
