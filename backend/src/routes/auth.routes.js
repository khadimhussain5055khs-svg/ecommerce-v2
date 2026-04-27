import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { authRequired } from '../middleware/auth.js';
import { signToken } from '../utils/jwt.js';

const router = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/register', async (req, res) => {
  const payload = authSchema.extend({ name: z.string().min(1) }).parse(req.body);
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    passwordHash,
    role: 'customer',
  });
  const token = signToken(user._id.toString());
  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

router.post('/login', async (req, res) => {
  const payload = authSchema.parse(req.body);
  const user = await User.findOne({ email: payload.email.toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user._id.toString());
  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

router.get('/me', authRequired, async (req, res) => {
  return res.json({ user: req.user });
});

export { router as authRoutes };
