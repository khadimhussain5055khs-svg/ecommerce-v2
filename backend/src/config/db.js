import { prisma } from '../lib/prisma.js';
import { env } from './env.js';

export async function connectDatabase() {
  try {
    await prisma.$connect();
    const dbHost = new URL(env.DATABASE_URL).host;
    console.log(`MySQL connected to ${dbHost}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}
