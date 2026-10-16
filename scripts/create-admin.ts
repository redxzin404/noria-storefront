import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@noria.local';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('Defina ADMIN_PASSWORD antes de criar o administrador.');
    process.exit(1);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      passwordHash: await argon2.hash(password),
    },
    create: {
      name: 'Administrador NÓRIA',
      email,
      passwordHash: await argon2.hash(password),
      role: 'ADMIN',
    },
  });

  console.log(`Administrador criado: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
