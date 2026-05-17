import 'dotenv/config';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

const url = process.env['DATABASE_URL'];
if (!url) throw new Error('DATABASE_URL is not set');

const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', name: 'Alice', passwordHash },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { email: 'bob@example.com', name: 'Bob', passwordHash },
  });

  const project = await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      name: 'Demo Project',
      description: 'A sample project for development',
      ownerId: alice.id,
      members: {
        create: [{ userId: alice.id }, { userId: bob.id }],
      },
    },
  });

  await prisma.task.create({
    data: { title: 'Set up project', status: 'DONE', projectId: project.id, assigneeId: alice.id },
  });
  await prisma.task.create({
    data: { title: 'Build API', status: 'IN_PROGRESS', projectId: project.id, assigneeId: alice.id },
  });
  await prisma.task.create({
    data: { title: 'Write tests', status: 'TODO', projectId: project.id, assigneeId: bob.id },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
