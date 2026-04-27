import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

async function run() {
  await connectDatabase();
  const existing = await User.findOne({ email: env.OWNER_EMAIL.toLowerCase() });
  if (existing) {
    console.log('Owner already exists');
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash(env.OWNER_PASSWORD, 10);
  await User.create({
    name: env.OWNER_NAME,
    email: env.OWNER_EMAIL.toLowerCase(),
    passwordHash,
    role: 'owner',
  });
  console.log('Owner account created');
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
