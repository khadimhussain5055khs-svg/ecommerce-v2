import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

const defaultCategories = [
  { name: 'Shoes', slug: 'shoes', description: 'All kinds of shoes' },
  { name: 'Shirts', slug: 'shirts', description: 'Casual and formal shirts' },
];

export async function bootstrapData() {
  const ownerEmail = env.OWNER_EMAIL.toLowerCase();
  const owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (!owner) {
    const passwordHash = await bcrypt.hash(env.OWNER_PASSWORD, 10);
    await prisma.user.create({ data: { name: env.OWNER_NAME, email: ownerEmail, passwordHash, role: 'owner' } });
    console.log('Owner user bootstrapped');
  }

  if ((await prisma.category.count()) === 0) {
    await prisma.category.createMany({ data: defaultCategories });
    console.log('Default categories bootstrapped');
  }
}

