import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

async function run() {
  await connectDatabase();
  const existing = await prisma.user.findUnique({ where: { email: env.OWNER_EMAIL.toLowerCase() } });
  if (existing) {
    console.log('Owner already exists');
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash(env.OWNER_PASSWORD, 10);
  await prisma.user.create({
    data: {
      name: env.OWNER_NAME,
      email: env.OWNER_EMAIL.toLowerCase(),
      passwordHash,
      role: 'owner',
    },
  });
  console.log('Owner account created');
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
