import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type Permission = Awaited<ReturnType<typeof prisma.permission.upsert>>;

const perms: Permission[] = [];

async function main() {
  console.log('جاري زرع البيانات (Seeding)... 🌱');

  const permNames = ['create:posts', 'delete:posts', 'create:users', 'manage:roles'];

  for (const name of permNames) {
    const p = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name, description: name },
    });
    perms.push(p); // ✅ الآن يعمل بدون خطأ
  }

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrator' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user', description: 'Regular user' },
  });

  await prisma.role.update({
    where: { id: adminRole.id },
    data: { permissions: { connect: perms.map((p) => ({ id: p.id })) } }, // ✅ يعمل
  });

  const createPostsPerm = perms.find((p) => p.name === 'create:posts'); // ✅ يعمل
  if (createPostsPerm) {
    await prisma.role.update({
      where: { id: userRole.id },
      data: { permissions: { connect: [{ id: createPostsPerm.id }] } }, // ✅ يعمل
    });
  }

  const hashed = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashed,
      isActive: true,
      roles: { connect: [{ id: adminRole.id }] },
    },
  });

  console.log('تم زرع البيانات بنجاح! ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });