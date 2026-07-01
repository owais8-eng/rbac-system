import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding... 🌱');

  // ── Permissions ──────────────────────────────────
  const permissionDefs = [
    'create:users', 'read:users', 'update:users', 'delete:users',
    'create:roles', 'read:roles', 'update:roles', 'delete:roles',
    'create:permissions', 'read:permissions', 'update:permissions', 'delete:permissions',
    'create:posts', 'read:posts', 'update:posts', 'delete:posts',
    'manage:roles', 'manage:permissions',
  ];

  const createdPerms: Record<string, Awaited<ReturnType<typeof prisma.permission.create>>> = {};
  for (const name of permissionDefs) {
    const p = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name, description: name },
    });
    createdPerms[name] = p;
  }

  // ── Roles ─────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Full system access' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user', description: 'Regular user with basic permissions' },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: { name: 'editor', description: 'Can manage posts' },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: { name: 'moderator', description: 'Can manage users and posts' },
  });

  // ── Role ↔ Permission assignments ────────────────
  // Admin gets all permissions
  await prisma.role.update({
    where: { id: adminRole.id },
    data: { permissions: { set: Object.values(createdPerms).map(p => ({ id: p.id })) } },
  });

  // Editor gets post permissions
  for (const name of ['create:posts', 'read:posts', 'update:posts', 'delete:posts']) {
    await prisma.role.update({
      where: { id: editorRole.id },
      data: { permissions: { connect: { id: createdPerms[name].id } } },
    });
  }

  // Moderator gets user read + all post permissions
  for (const name of ['read:users','create:posts', 'read:posts', 'update:posts', 'delete:posts']) {
    await prisma.role.update({
      where: { id: moderatorRole.id },
      data: { permissions: { connect: { id: createdPerms[name].id } } },
    });
  }

  // User gets read:posts + create:posts
  for (const name of ['read:posts', 'create:posts']) {
    await prisma.role.update({
      where: { id: userRole.id },
      data: { permissions: { connect: { id: createdPerms[name].id } } },
    });
  }

  // ── Users ─────────────────────────────────────────
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

  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: hashed,
      isActive: true,
      roles: { connect: [{ id: userRole.id }] },
    },
  });

  await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      name: 'Editor User',
      password: hashed,
      isActive: true,
      roles: { connect: [{ id: editorRole.id }] },
    },
  });

  await prisma.user.upsert({
    where: { email: 'moderator@example.com' },
    update: {},
    create: {
      email: 'moderator@example.com',
      name: 'Moderator User',
      password: hashed,
      isActive: true,
      roles: { connect: [{ id: moderatorRole.id }] },
    },
  });

  // ── Direct user permissions (example) ────────────
  // Give testUser a direct permission bypassing roles
  await prisma.user.update({
    where: { id: testUser.id },
    data: { permissions: { connect: { id: createdPerms['delete:posts'].id } } },
  });

  // ── Audit log example ─────────────────────────────
  await prisma.auditLog.create({
    data: {
      action: 'SEED',
      entity: 'System',
      userEmail: 'system',
      metadata: { message: 'Database seeded successfully' },
    },
  });

  console.log('Seed complete ✅');
  console.log('─── Credentials ───');
  console.log('admin@example.com / password123 (all permissions)');
  console.log('user@example.com   / password123 (basic user)');
  console.log('editor@example.com / password123 (post management)');
  console.log('moderator@example.com / password123 (users + posts)');
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
