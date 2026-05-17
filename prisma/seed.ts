import {
  PrismaClient,
  TaleAccessType,
  UserRole,
  UserStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Страхи', slug: 'strakhy' },
    { name: 'Втрата', slug: 'vtrata' },
    { name: 'Адаптація', slug: 'adaptatsiia' },
    { name: 'Сон', slug: 'son' },
    { name: 'Тривожність', slug: 'tryvozhnist' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
      name: 'Owner',
    },
    create: {
      email: 'owner@example.com',
      name: 'Owner',
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      name: 'Admin',
    },
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'psychologist@example.com' },
    update: {
      role: UserRole.PSYCHOLOGIST,
      status: UserStatus.ACTIVE,
      name: 'Psychologist',
    },
    create: {
      email: 'psychologist@example.com',
      name: 'Psychologist',
      role: UserRole.PSYCHOLOGIST,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      name: 'Customer',
    },
    create: {
      email: 'customer@example.com',
      name: 'Customer',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'blocked-user@example.com' },
    update: {
      role: UserRole.CUSTOMER,
      status: UserStatus.BLOCKED,
      name: 'Blocked User',
    },
    create: {
      email: 'blocked-user@example.com',
      name: 'Blocked User',
      role: UserRole.CUSTOMER,
      status: UserStatus.BLOCKED,
    },
  });

  await prisma.tale.upsert({
    where: { slug: 'nich-bez-strakhu' },
    update: {},
    create: {
      title: 'Ніч без страху',
      slug: 'nich-bez-strakhu',
      shortDescription: 'М’яка терапевтична казка для вечірнього заспокоєння.',
      fullDescription:
        'Допомагає дитині безпечно прожити тривогу перед сном через теплу історію та зрозумілі образи.',
      accessType: TaleAccessType.FREE,
      published: true,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
