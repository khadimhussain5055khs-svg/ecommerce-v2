import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

export async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
