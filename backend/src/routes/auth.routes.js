import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authRequired } from '../middleware/auth.js';
import { signToken } from '../utils/jwt.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const credentialsUpdateSchema = z.object({
  currentPassword: z.string().min(8),
  email: z.string().email().optional(),
  newPassword: z.string().min(8).optional(),
});

router.post('/register', async (req, res) => {
  const payload = authSchema.extend({ name: z.string().min(1) }).parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash,
      role: 'customer',
    },
  });
  const token = signToken(user.id);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.post('/login', async (req, res) => {
  const payload = authSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user.id);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.get('/me', authRequired, async (req, res) => {
  return res.json({ user: req.user });
});

router.patch('/credentials', authRequired, async (req, res) => {
  const payload = credentialsUpdateSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const valid = await bcrypt.compare(payload.currentPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

  if (payload.email && payload.email.toLowerCase() !== user.email) {
    const duplicate = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
    if (duplicate) return res.status(409).json({ message: 'Email already in use' });
    user.email = payload.email.toLowerCase();
  }

  if (payload.newPassword) {
    user.passwordHash = await bcrypt.hash(payload.newPassword, 10);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: user.email,
      passwordHash: user.passwordHash,
    },
  });
  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export { router as authRoutes };
