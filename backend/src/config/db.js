import { prisma } from '../lib/prisma.js';

export async function connectDatabase() {
  await prisma.$connect();
  console.log('MySQL connected');
}
